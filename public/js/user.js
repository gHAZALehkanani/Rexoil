document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info');

    // Kullanıcı bilgilerini API'den çek ve ekrana yazdır
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            userInfoDiv.innerHTML = `
                <p><strong>İsim:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Telefon:</strong> ${data.phone}</p>
            `;
        })
        .catch(error => {
            userInfoDiv.innerHTML = `<p>Bilgiler yüklenemedi. Hata: ${error.message}</p>`;
        });
});
