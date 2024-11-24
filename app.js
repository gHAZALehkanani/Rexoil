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

// Sunucuyu başlat
app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});

// reservasyon sayfası için ekledim
app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservation.html'));
});
