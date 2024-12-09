document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info');

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
});


