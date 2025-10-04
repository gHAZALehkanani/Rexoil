document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map', {
        center: [39.92077, 32.85411], // Türkiye koordinatları
        zoom: 6,
        minZoom: 5,
        maxZoom: 22
    });

    const turkeyBounds = [
        [35.808593, 25.078125],  // Güney Batı
        [42.256041, 44.820313]   // Kuzey Doğu
    ];
    map.setMaxBounds(turkeyBounds);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
    }).addTo(map);

    const markerIcons = {
        oteller: 'https://cdn-icons-png.flaticon.com/512/1926/1926407.png',
        akaryakit_ist: 'https://cdn-icons-png.flaticon.com/512/465/465090.png',
        restoranlar: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
        satis_noktalari: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
    };

    const markers = {}; // Marker'ları kategorilere göre saklayacağız
    const allMarkers = []; // flat list with metadata {marker, category, city}

    // Verileri fetch ile çek ve haritaya ekle
    fetch('/api/locations')
        .then(response => {
            if (!response.ok) throw new Error('Veri alınamadı');
            return response.json();
        })
        .then(data => {
            // collect cities
            const citySet = new Set();

            Object.keys(data).forEach(category => {
                const iconUrl = markerIcons[category];
                markers[category] = [];

                data[category].forEach(location => {
                    if (!location.lat || !location.lng) return;
                    const city = location.city || location.sehir || location.il || location.il_adi || null;
                    if (city) citySet.add(city);

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

                    // store metadata
                    const meta = { marker, category, city };
                    allMarkers.push(meta);

                    markers[category].push(marker);
                    marker.addTo(map);
                });
            });

            // populate custom city picker (dropdown now placed above the map)
            const cityListEl = document.getElementById('city-list');
            const citySearch = document.getElementById('city-search');
            const filterToggle = document.querySelector('.filter-toggle');
            const filterPanel = document.querySelector('.filter-panel');
            const selectAllBtn = document.getElementById('select-all-cities');
            const clearBtn = document.getElementById('clear-cities');
            const populateCities = (citiesArr) => {
                if (!cityListEl) return;
                cityListEl.innerHTML = '';
                const cities = citiesArr.sort((a,b) => a.localeCompare(b, 'tr'));
                cities.forEach(c => {
                    const safeId = 'city-' + c.replace(/[^a-z0-9_-]/gi, '_');
                    const row = document.createElement('div');
                    row.className = 'city-row';
                    row.innerHTML = `<input type="checkbox" class="city-checkbox" value="${c}" id="${safeId}"><label for="${safeId}">${c}</label>`;
                    cityListEl.appendChild(row);
                });
            };

            // Try to fetch cities from server; fall back to derived citySet
            fetch('/api/sehirler')
                .then(resp => resp.ok ? resp.json() : Promise.reject())
                .then(citiesFromServer => {
                    if (Array.isArray(citiesFromServer) && citiesFromServer.length > 0) populateCities(citiesFromServer);
                    else populateCities(Array.from(citySet));
                })
                .catch(() => {
                    populateCities(Array.from(citySet));
                });

            if (cityListEl) {
                // wire city checkbox change
                cityListEl.addEventListener('change', (e) => {
                    if (e.target && e.target.classList.contains('city-checkbox')) applyFilters();
                });

                // dropdown toggle
                if (filterToggle && filterPanel) {
                    filterToggle.addEventListener('click', () => {
                        const open = filterPanel.classList.toggle('open');
                        filterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                    });

                    // click outside to close
                    document.addEventListener('click', (ev) => {
                        if (!filterPanel.contains(ev.target) && !filterToggle.contains(ev.target)) {
                            filterPanel.classList.remove('open');
                            filterToggle.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                if (selectAllBtn) {
                    selectAllBtn.addEventListener('click', () => {
                        cityListEl.querySelectorAll('.city-checkbox').forEach(cb => cb.checked = true);
                        applyFilters();
                    });
                }

                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        cityListEl.querySelectorAll('.city-checkbox').forEach(cb => cb.checked = false);
                        applyFilters();
                    });
                }

                // search filter
                if (citySearch) {
                    citySearch.addEventListener('input', () => {
                        const q = citySearch.value.trim().toLowerCase();
                        Array.from(cityListEl.children).forEach(row => {
                            const label = row.querySelector('label').textContent.toLowerCase();
                            row.style.display = label.includes(q) ? 'flex' : 'none';
                        });
                    });
                }
            }
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
            // re-apply combined filters when categories change
            applyFilters();
        });
    });
    
    // helper to apply category + city filters
    function applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(c => c.value);
        const selectedCities = Array.from(document.querySelectorAll('.city-checkbox:checked')).map(c => c.value);

        allMarkers.forEach(({ marker, category, city }) => {
            const categoryMatch = selectedCategories.includes(category);
            const cityMatch = selectedCities.length === 0 || (city && selectedCities.includes(city));
            if (categoryMatch && cityMatch) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    }
});

