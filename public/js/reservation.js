// URL'den otel adını al
const params = new URLSearchParams(window.location.search);
const hotelName = params.get('hotel');

// DOMContentLoaded ile DOM yüklendikten sonra işlemleri yap
document.addEventListener('DOMContentLoaded', () => {
    // Otel adını forma yerleştir
    if (hotelName) {
        document.getElementById('hotel-name').value = hotelName;
    }

    // Form gönderimini işleyerek bildirim göster
    document.getElementById('reservation-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Formun sunucuya gönderilmesini engelle

        // Form verilerini al
        const checkIn = document.getElementById('check-in').value;
        const checkOut = document.getElementById('check-out').value;

        // Bildirim mesajını ayarla
        const notification = document.getElementById('notification');
        notification.textContent = `${hotelName} otelinde ${checkIn} - ${checkOut} tarih aralığında rezervasyon yapılmıştır.`;
        notification.style.display = 'block'; // Bildirimi göster

        // Formu temizle
        this.reset();
    });
});
