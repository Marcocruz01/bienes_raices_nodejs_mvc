(function() {
    // leer campos ocultos de lat y lng
    const lat = document.querySelector('#lat').textContent;
    const lng = document.querySelector('#lng').textContent;
    const titulo = document.querySelector('#titulo').textContent;
    const calle = document.querySelector('#calle').textContent;
    // Definir el mapa
    const mapa = L.map('mapa').setView([lat, lng], 19);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // agregar el pin 
    L.marker([lat, lng])
        .addTo(mapa)
        .bindPopup(`${titulo}, ${calle}`);
})();