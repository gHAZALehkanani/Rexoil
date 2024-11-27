document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map', {
        center: [39.92077, 32.85411], // Türkiye koordinatları
        zoom: 6,
        minZoom: 5,
        maxZoom: 10
    });

    // Türkiye sınırlarını belirle
    const turkeyBounds = [
        [35.808593, 25.078125],  // Güney Batı
        [42.256041, 44.820313]   // Kuzey Doğu
    ];
    map.setMaxBounds(turkeyBounds);

    // Harita katmanı
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Kategorilere özel ikonlar
    const markerIcons = {
        hotels: 'https://www.iconpacks.net/icons/3/free-hotel-icon-9212-thumb.png', // Otel ikonu
        gas_stations: 'https://pnghq.com/wp-content/uploads/gas-station-free-png-images-download-91286-400x400.png', // Akaryakıt ikonu
        restaurants: 'https://uxwing.com/wp-content/themes/uxwing/download/food-and-drinks/food-restaurant-icon.png', // Restoran ikonu
        sales_points: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' // Satış noktası ikonu
    };

    // JSON verisini çek
    fetch('/api/locations') // JSON dosyasının URL'si
        .then(response => response.json())
        .then(data => {
            // Kategorileri işle
            Object.keys(data).forEach(category => {
                const iconUrl = markerIcons[category];

                // İlgili kategorideki her bir konumu işle
                data[category].forEach(location => {
                    const popupContent = `
                        <b>${location.name}</b><br>
                        ${category.replace('_', ' ').toUpperCase()}<br>
                        <a href="/reservation?hotel=${encodeURIComponent(location.name)}">Rezervasyon Yap</a>
                    `;

                    // Marker ikonunu oluştur
                    const markerIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `<img src="${iconUrl}" alt="${category}" style="width: 30px; height: 30px; z-index: 1000;">`,
                        iconSize: [30, 30]
                    });

                    // Marker ekle
                    const marker = L.marker([location.lat, location.lng], { icon: markerIcon }).addTo(map);
                    marker.bindPopup(popupContent);

                    // Marker tıklanınca bilgi kutusunu güncelle
                    marker.on('click', () => {
                        const infoBox = document.querySelector('.info-box p');
                        infoBox.textContent = `${location.name} (${category.replace('_', ' ')}) hakkında bilgi.`;
                    });
                });
            });
        })
        .catch(error => console.error('JSON verisi alınırken hata:', error));
});
