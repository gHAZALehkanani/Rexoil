// URL'den otel adını al
const params = new URLSearchParams(window.location.search);
const hotelName = params.get('hotel');

document.addEventListener('DOMContentLoaded', () => {
    // Seçilemeyecek tarihler
    const disabledDates = [
        "2024-12-17", // Örnek tarihler
        "2024-12-22",
        "2024-12-27"
    ];

    // Giriş tarihi takvimi
    flatpickr("#check-in", {
        locale: "tr", // Türkçe dil desteği
        disable: disabledDates.map(date => new Date(date)), // Seçilemeyecek tarihler
        dateFormat: "Y-m-d", // Tarih formatı
        minDate: "today", // Bugünden önceki tarihler devre dışı
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            // Seçilemez günleri kırmızı çarpı ile göster
            const day = dayElem.dateObj.toISOString().split('T')[0]; // Günün tarihi
            if (disabledDates.includes(day)) {
                dayElem.classList.add('disabled-day'); // Özel sınıf eklenir
            }
        }
    });

    // Çıkış tarihi takvimi
    flatpickr("#check-out", {
        locale: "tr",
        disable: disabledDates.map(date => new Date(date)),
        dateFormat: "Y-m-d",
        minDate: "today",
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const day = dayElem.dateObj.toISOString().split('T')[0]; // Günün tarihi
            if (disabledDates.includes(day)) {
                dayElem.classList.add('disabled-day');
            }
        }
    });

    // Form gönderimini işleme
    document.getElementById('reservation-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const checkIn = document.getElementById('check-in').value;
        const checkOut = document.getElementById('check-out').value;

        try {
            const response = await fetch('/api/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hotelName, checkIn, checkOut })
            });

            const result = await response.json();

            // Bildirim mesajı
            const notification = document.getElementById('notification');
            if (response.ok) {
                notification.textContent = result.message;
                notification.style.color = 'green';
            } else {
                notification.textContent = result.message || 'Bir hata oluştu.';
                notification.style.color = 'red';
            }
            notification.style.display = 'block';

            // Formu temizle
            this.reset();
        } catch (error) {
            console.error('Hata:', error);
            alert('Rezervasyon işlemi sırasında bir hata oluştu.');
        }
    });
});
