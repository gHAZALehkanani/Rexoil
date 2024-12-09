document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map', {
        center: [39.92077, 32.85411], // Türkiye koordinatları
        zoom: 6,
        minZoom: 5,
        maxZoom: 10
    });

    const turkeyBounds = [
        [35.808593, 25.078125],  // Güney Batı
        [42.256041, 44.820313]   // Kuzey Doğu
    ];
    map.setMaxBounds(turkeyBounds);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    const markerIcons = {
        oteller: 'https://cdn-icons-png.flaticon.com/512/1926/1926407.png',
        akaryakit_ist: 'https://cdn-icons-png.flaticon.com/512/465/465090.png',
        restoranlar: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
        satis_noktalari: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
    };

    const markers = {}; // Marker'ları kategorilere göre saklayacağız

    // Verileri fetch ile çek ve haritaya ekle
    fetch('/api/locations')
        .then(response => {
            if (!response.ok) throw new Error('Veri alınamadı');
            return response.json();
        })
        .then(data => {
            Object.keys(data).forEach(category => {
                const iconUrl = markerIcons[category];
                markers[category] = [];

                data[category].forEach(location => {
                    if (!location.lat || !location.lng) return;

                    let popupContent;

                    if (category === 'satis_noktalari') {
                        popupContent = `
                            <b>${location.name}</b>
                            <div class="popup-buttons">
                                <button class="nearest-button" data-category="oteller" data-lat="${location.lat}" data-lng="${location.lng}">En Yakın Otel</button>
                                <button class="nearest-button" data-category="restoranlar" data-lat="${location.lat}" data-lng="${location.lng}">En Yakın Restoran</button>
                                <button class="nearest-button" data-category="akaryakit_ist" data-lat="${location.lat}" data-lng="${location.lng}">En Yakın Akaryakıt</button>
                            </div>
                        `;
                    } else if (category === 'oteller') {
                        popupContent = `
                            <b>${location.name}</b>
                            <div class="popup-buttons">
                                <button class="reservation-button" data-hotel="${location.name}">Rezervasyon Yap</button>
                            </div>
                        `;
                    } else {
                        popupContent = `<b>${location.name}</b><br>${category.replace('_', ' ').toUpperCase()}`;
                    }

                    const markerIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `<img src="${iconUrl}" alt="${category}" style="width: 30px; height: 30px;">`,
                        iconSize: [30, 30]
                    });

                    const marker = L.marker([location.lat, location.lng], { icon: markerIcon });
                    marker.bindPopup(popupContent);

                    markers[category].push(marker);
                    marker.addTo(map);
                });
            });
        })
        .catch(error => {
            console.error('Hata:', error.message);
        });

    // Rezervasyon butonu ve en yakın nokta butonları için olay dinleyiciler
    map.on('popupopen', (e) => {
        const popup = e.popup.getElement();

        // Rezervasyon butonu
        const reservationButton = popup.querySelector('.reservation-button');
        if (reservationButton) {
            reservationButton.addEventListener('click', () => {
                const hotelName = reservationButton.getAttribute('data-hotel');
                // Rezervasyon sayfasına yönlendirme yap
                window.location.href = `/reservation?hotel=${encodeURIComponent(hotelName)}`;
            });
        }
        

        // En yakın nokta butonları
        const nearestButtons = popup.querySelectorAll('.nearest-button');
        nearestButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                const lat = parseFloat(button.getAttribute('data-lat'));
                const lng = parseFloat(button.getAttribute('data-lng'));

                const nearest = markers[category]?.reduce((closest, marker) => {
                    const distance = map.distance([lat, lng], marker.getLatLng());
                    return distance < closest.distance
                        ? { marker, distance }
                        : closest;
                }, { marker: null, distance: Infinity });

                if (nearest.marker) {
                    map.flyTo(nearest.marker.getLatLng(), 10, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });

                    nearest.marker.openPopup();
                }
            });
        });
    });

    // Kategori checkbox'larını yönet
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const category = checkbox.value;
            if (checkbox.checked) {
                markers[category]?.forEach(marker => marker.addTo(map));
            } else {
                markers[category]?.forEach(marker => map.removeLayer(marker));
            }
        });
    });
});

// Rezervasyon butonu için olay dinleyici
map.on('popupopen', (e) => {
    const popup = e.popup.getElement();

    // Rezervasyon butonu
    const reservationButton = popup.querySelector('.reservation-button');
    if (reservationButton) {
        reservationButton.addEventListener('click', () => {
            const hotelName = reservationButton.getAttribute('data-hotel');
            // Kullanıcıyı rezervasyon sayfasına yönlendirme
            window.location.href = `/reservation?hotel=${encodeURIComponent(hotelName)}`;
        });
    }

    // Mevcut "En Yakın Nokta" butonları için işlem
    const nearestButtons = popup.querySelectorAll('.nearest-button');
    nearestButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            const lat = parseFloat(button.getAttribute('data-lat'));
            const lng = parseFloat(button.getAttribute('data-lng'));

            const nearest = markers[category]?.reduce((closest, marker) => {
                const distance = map.distance([lat, lng], marker.getLatLng());
                return distance < closest.distance
                    ? { marker, distance }
                    : closest;
            }, { marker: null, distance: Infinity });

            if (nearest.marker) {
                map.flyTo(nearest.marker.getLatLng(), 10, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });

                nearest.marker.openPopup();
            }
        });
    });
});
