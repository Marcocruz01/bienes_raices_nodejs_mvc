(function() {
    // Logical Or
    const lat = document.querySelector('#lat').value || 20.6508652;
    const lng = document.querySelector('#lng').value || -103.2299415;
    const mapa = L.map('mapa').setView([lat, lng ], 19);
    let marker;

    // Utilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    
    // El Pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    // detectar el movimiento del pin
    marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obtener la informacion de las calles al soltar el PIN
        geocodeService.reverse().latlng(posicion, 19).run(function(error, resultado) {
            marker.bindPopup(resultado.address.LongLabel);

            // llenar los campos
            document.querySelector('.calle').textContent = resultado?.address.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        });
    });

})()