const express = require('express');
const path = require('path');
const app = express();
const db = require('./db');
const session = require('express-session');
const nodemailer = require('nodemailer');

// Express uygulamasına session middleware'i ekleyin
app.use(session({
    secret: 'G', // Oturumlar için bir gizli anahtar belirleyin
    resave: false,
    saveUninitialized: true
}));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML dosyalarını servis etme
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'map.html'));
});

app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservation.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user.html'));
});




app.post('/login', (req, res) => {
    const { ad, soyad, password } = req.body;

    const query = 'SELECT * FROM personeller WHERE ad = ? AND soyad = ? AND password = ?';
    db.query(query, [ad, soyad, password], (err, results) => {
        if (err) {
            console.error('Veritabanı sorgu hatası:', err);
            return res.status(500).json({ message: 'Bir hata oluştu.' });
        }

        if (results.length > 0) {
            // Kullanıcı bulundu
            const user = results[0]; // Kullanıcı bilgilerini alın
            req.session.user = user;
            
            res.redirect('/profile');
        } else {
            // Kullanıcı bulunamadı
            res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });
        }
    });
});




app.get('/api/user', (req, res) => {
    if (req.session.user) {
        // Giriş yapan kullanıcının bilgilerini döndür
        res.json(req.session.user);
    } else {
        // Kullanıcı oturum açmamışsa hata döndür
        res.status(401).json({ message: 'Kullanıcı oturum açmamış.' });
    }
});




// Lokasyon verilerini döndürme
app.get('/api/locations', (req, res) => {
    const tableMap = {
        oteller: { nameCol: 'otel_adi' },
        satis_noktalari: { nameCol: 'satis_nokta_adi' },
        akaryakit_ist: { nameCol: 'akaryakit_ist_adi' },
        restoranlar: { nameCol: 'restoran_adi' }
    };

    const results = {};
    const categories = Object.keys(tableMap);
    let completed = 0;

    categories.forEach(category => {
        const tableName = category;
        // Always join with sehirler table to get city name
        const sel = `SELECT ${tableMap[category].nameCol} AS name, t.lat, t.lng, s.sehir_adi AS city FROM ${tableName} t JOIN sehirler s ON t.sehir_id = s.sehir_id`;

        db.query(sel, (err, rows) => {
            if (err) {
                console.error(`Error querying ${category}:`, err);
                results[category] = [];
            } else {
                results[category] = rows;
            }

            completed++;
            if (completed === categories.length) {
                res.json(results);
            }
        });
    });
});

// Provide list of cities from sehirler table for client filters
app.get('/api/sehirler', (req, res) => {
    const sql = `SELECT sehir_adi FROM sehirler ORDER BY sehir_adi`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching sehirler:', err);
            return res.status(500).json([]);
        }
        const cities = rows.map(r => r.sehir_adi);
        res.json(cities);
    });
});





app.post('/api/reservation', (req, res) => {
    const { hotelName, checkIn, checkOut } = req.body;

    // Oturumdaki kullanıcı bilgisi
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ message: 'Oturum açmanız gerekiyor.' });
    }

    // Otel ID'sini otel adından bulmak için sorgu
    const getHotelQuery = `SELECT otel_id FROM oteller WHERE otel_adi = ?`;
    db.query(getHotelQuery, [hotelName], (err, hotelResults) => {
        if (err) {
            console.error('Otel sorgu hatası:', err);
            return res.status(500).json({ message: 'Bir hata oluştu.' });
        }

        if (hotelResults.length === 0) {
            return res.status(404).json({ message: 'Otel bulunamadı.' });
        }

        const otelId = hotelResults[0].otel_id;

        // Rezervasyonu ekleme sorgusu
        const addReservationQuery = `
            INSERT INTO rezervasyon (otel_id, personel_id, giris_tarihi, cikis_tarihi)
            VALUES (?, ?, ?, ?)
        `;
        db.query(
            addReservationQuery,
            [otelId, user.personel_id, checkIn, checkOut],
            (err, results) => {
                if (err) {
                    console.error('Rezervasyon ekleme hatası:', err);
                    return res.status(500).json({ message: 'Rezervasyon eklenemedi.' });
                }

                res.json({ message: 'Rezervasyon başarıyla kaydedildi.' });
            }
        );
    });
});


// Kullanıcının rezervasyonlarını döndür
app.get('/api/user/reservations', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Oturum açmanız gerekiyor.' });
    }

    const personelId = req.session.user.personel_id;

    const query = `
        SELECT 
            r.giris_tarihi, 
            r.cikis_tarihi, 
            o.otel_adi AS hotelName,
            o.lat AS hotelLat,
            o.lng AS hotelLng,
            (SELECT satis_nokta_adi 
             FROM satis_noktalari 
             ORDER BY ST_Distance_Sphere(POINT(satis_noktalari.lng, satis_noktalari.lat), POINT(o.lng, o.lat)) 
             LIMIT 1) AS nearestSalesPoint,
            (SELECT restoran_adi 
             FROM restoranlar 
             ORDER BY ST_Distance_Sphere(POINT(restoranlar.lng, restoranlar.lat), POINT(o.lng, o.lat)) 
             LIMIT 1) AS nearestRestaurant,
            (SELECT akaryakit_ist_adi 
             FROM akaryakit_ist 
             ORDER BY ST_Distance_Sphere(POINT(akaryakit_ist.lng, akaryakit_ist.lat), POINT(o.lng, o.lat)) 
             LIMIT 1) AS nearestGasStation
        FROM rezervasyon r
        JOIN oteller o ON r.otel_id = o.otel_id
        WHERE r.personel_id = ?
    `;

    db.query(query, [personelId], (err, results) => {
        if (err) {
            console.error('Veri çekme hatası:', err);
            return res.status(500).json({ message: 'Rezervasyon bilgileri alınamadı.' });
        }

        res.json(results);
    });
});


//  endpoint: E-postayı gönderir
app.post('/api/sendEmail', (req, res) => {
    const { hotelName, checkIn, checkOut, personelEmail } = req.body;

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'raspberrypiybs2023@gmail.com',
            pass: 'mdkh kpke ihnq gdvx' // Gmail uygulama şifresi
        }
    });

    const mailOptions = {
        from: 'raspberrypiybs2023@gmail.com',
        to: personelEmail,
        subject: `Yeni Rezervasyon - ${hotelName}`,
        text: `Merhaba,\n\n${hotelName} için ${checkIn} - ${checkOut} tarihleri arasında yeni bir rezervasyon yapıldı.`
    };

    transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
            console.error('E-posta gönderim hatası:', emailErr);
            return res.status(500).json({ message: 'E-posta gönderilemedi.' });
        }

        res.json({ message: 'E-posta başarıyla gönderildi.' });
    });
});




// Sunucuyu başlat
app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});


