document.addEventListener('DOMContentLoaded', () => {

    // URL'den otel adını al
    const params = new URLSearchParams(window.location.search);
    const hotelName = params.get('hotel'); // 'hotel' parametresini al

    // Otel adını formda göster
    const hotelNameInput = document.getElementById('hotel-name');
    if (hotelName && hotelNameInput) {
        hotelNameInput.value = hotelName; // Otel adını input alanına yaz
    }


    // Giriş için seçilemeyecek tarihler
    const disabledCheckInDates = [
        "2024-12-17",
        "2024-12-22",
        "2024-12-27"
    ];

    // Çıkış için seçilemeyecek tarihler
    const disabledCheckOutDates = [
        "2024-12-18",
        "2024-12-23",
        "2024-12-28"
    ];

    // Giriş tarihi takvimi
    const checkInPicker = flatpickr("#check-in", {
        locale: "tr", // Türkçe dil desteği
        disable: disabledCheckInDates, // Giriş için seçilemeyecek tarihler
        dateFormat: "Y-m-d", // Tarih formatı
        minDate: "today", // Bugünden önceki tarihler devre dışı
        onReady: function(selectedDates, dateStr, instance) {
            // Devre dışı tarihler için CSS sınıfı uygulaması
            instance.calendarContainer.querySelectorAll('.flatpickr-day').forEach(dayElem => {
                const day = dayElem.dateObj.toISOString().split('T')[-1];
                if (disabledCheckInDates.includes(day)) {
                    dayElem.classList.add('disabled-day');
                }
            });
        }
    });

    // Çıkış tarihi takvimi
    const checkOutPicker = flatpickr("#check-out", {
        locale: "tr", // Türkçe dil desteği
        disable: disabledCheckOutDates, // Çıkış için seçilemeyecek tarihler
        dateFormat: "Y-m-d", // Tarih formatı
        minDate: "today", // Bugünden itibaren seçim yapılabilir
        onReady: function(selectedDates, dateStr, instance) {
            // Devre dışı tarihler için CSS sınıfı uygulaması
            instance.calendarContainer.querySelectorAll('.flatpickr-day').forEach(dayElem => {
                const day = dayElem.dateObj.toISOString().split('T')[-1];
                if (disabledCheckOutDates.includes(day)) {
                    dayElem.classList.add('disabled-day');
                }
            });
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
