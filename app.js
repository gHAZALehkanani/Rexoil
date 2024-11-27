const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Dinamik veri için API
app.get('/api/locations', (req, res) => {
    const locations = require('./data/locations.json');
    res.json(locations);
});

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

// reservasyon sayfası için ekledim
app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservation.html'));
});

// Kullanıcı bilgileri (örnek veri)
const userInfo = {
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "+90 555 555 5555"
};

// Kullanıcı bilgilerini dönen API
app.get('/api/user', (req, res) => {
    res.json(userInfo); // Kullanıcı bilgilerini JSON olarak döner
});

// Kullanıcı ekranı (user.html)
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user.html'));
});


// Sunucuyu başlat
app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});


