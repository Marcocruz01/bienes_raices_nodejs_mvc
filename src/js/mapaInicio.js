(function() {
    const lat = 20.6508652;
    const lng = -103.2299415;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 19);
    let markers = new L.FeatureGroup().addTo(mapa);

    // variable de propiedades como arreglo vacio
    let propiedades = [];

    // Seleccionar elementos
    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    // Filtros
    const filtros =  {
        categoria: '',
        precio: ''
    }


    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // filtrado de categorias y precios 
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        filtrarPropiedades();
    });

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    });
   
    const obtenerPropiedades = async () => {
        try {
            const url = '/api/propiedades';
            const respuesta = await fetch(url);
            propiedades = await respuesta.json();
            mostrarPropiedades(propiedades);
        } catch (error) {
            console.log(error);
        }
    }

    const mostrarPropiedades = propiedades => {
        // limpiar los marker previos
        markers.clearLayers();
        propiedades.forEach(propiedad => {
            // agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true,
            }).addTo(mapa).bindPopup(`
                <p class="text-blue-700 uppercase font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-sm font-bold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad.titulo}"/>
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-blue-700 rounded-lg block p-2 text-center font-bold uppercase ">Ver propiedad</a>
            `)
            markers.addLayer(marker);
        });
    }

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter( filtrarCategoria ).filter( filtrarPrecio )
        mostrarPropiedades(resultado);
    }
    // filtro de categorias
    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;
    // filtro de precios
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;

    obtenerPropiedades();

})();