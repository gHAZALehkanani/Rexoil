document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info');
    const reservationsDiv = document.getElementById('reservations');

    // Kullanıcı bilgilerini API'den çek ve ekrana yazdır
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            userInfoDiv.innerHTML = `
                <p><strong>Ad:</strong> ${data.ad}</p>
                <p><strong>Soyad:</strong> ${data.soyad}</p>
                <p><strong>Şifre:</strong> ${data.password}</p>
            `;
        })
        .catch(error => {
            userInfoDiv.innerHTML = `<p>Bilgiler yüklenemedi. Hata: ${error.message}</p>`;
        });

    // Kullanıcının rezervasyonlarını çek ve ekrana yazdır
    fetch('/api/user/reservations')
        .then(response => response.json())
        .then(reservations => {
            if (reservations.length === 0) {
                reservationsDiv.innerHTML = '<p>Rezervasyon bulunamadı.</p>';
            } else {
                reservationsDiv.innerHTML = '<ul>';
                reservations.forEach(reservation => {
                    const girisTarihi = new Date(reservation.giris_tarihi).toLocaleDateString('tr-TR');
                    const cikisTarihi = new Date(reservation.cikis_tarihi).toLocaleDateString('tr-TR');
                    reservationsDiv.innerHTML += `<li><p><strong>Otel:</strong> ${reservation.hotelName}</p>
                            <p><strong>Giriş Tarihi:</strong> ${girisTarihi}</p>
                            <p><strong>Çıkış Tarihi:</strong> ${cikisTarihi}</p>
                            <h3>Otele En Yakın Noktalar:</h3>
                            <ul>
                                <li><strong>Satış Noktası:</strong> ${reservation.nearestSalesPoint}</li>
                                <li><strong>Restoran:</strong> ${reservation.nearestRestaurant}</li>
                                <li><strong>Akaryakıt İstasyonu:</strong> ${reservation.nearestGasStation}</li>
                            </ul>
                        </li>
                    `;
                });
                reservationsDiv.innerHTML += '</ul>';
            }
        })
        .catch(error => {
            reservationsDiv.innerHTML = `<p>Rezervasyon bilgileri yüklenemedi. Hata: ${error.message}</p>`;
        });
});
