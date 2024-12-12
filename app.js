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




// Profile sayfası
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Giriş yapmanız gerekiyor.' });
    }

    // Kullanıcı bilgilerini döndürün veya bir HTML sayfasında göstermek için kullanın
    res.json({ user: req.session.user });
});




// Lokasyon verilerini döndürme
app.get('/api/locations', (req, res) => {
    const queries = {
        oteller: `SELECT otel_adi AS name, lat, lng FROM oteller`,
        satis_noktalari: `SELECT satis_nokta_adi AS name, lat, lng FROM satis_noktalari`,
        akaryakit_ist: `SELECT akaryakit_ist_adi AS name, lat, lng FROM akaryakit_ist`,
        restoranlar: `SELECT restoran_adi AS name, lat, lng FROM restoranlar`
    };

    const results = {};

    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.keys(queries).forEach(category => {
        db.query(queries[category], (err, rows) => {
            if (err) {
                console.error(`Error querying ${category}:`, err);
                results[category] = []; // Hata durumunda bu kategoriyi boş bırak
            } else {
                results[category] = rows;
            }

            completedQueries++;
            if (completedQueries === totalQueries) {
                // Tüm sorgular tamamlandığında yanıtı gönder
                res.json(results);
            }
        });
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





// Sunucuyu başlat
app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});


