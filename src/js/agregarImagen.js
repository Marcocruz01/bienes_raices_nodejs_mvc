import { Dropzone } from 'dropzone';
const token = document.querySelector('meta[name="csrf-token"').getAttribute('content');
Dropzone.options.imagen =  {
    dictDefaultMessage: 'Sube o Arrastra tus imagenes aqui...',
    acceptedFiles: '.png,.jpg,.jpeg', // Formatos aceptables
    maxFilesize: 5, // Maximo imagenes de 5 MB
    maxFiles: 1, // Cantidad maxima
    parallelUploads: 1, // Cantidad de archivos soportados en la subida
    autoProcessQueue: false, // Evitar subir la imagen en automatico
    addRemoveLinks: true, // Agrgear el boton de Remove
    dictRemoveFile: 'Eliminar imagen', // Cambiar de idioma el boton
    dictMaxFilesExceeded: 'El limite de subida es un solo archivo', // Cambiar el idioma del texto de error
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');
        btnPublicar.addEventListener('click', () => {
            dropzone.processQueue();
        });
        dropzone.on('queuecomplete', function() {
            if(dropzone.getActiveFiles().length === 0 ) {
                window.location.href = '/mis-propiedades';
            }
        }); // Evento de dropzone
    }
}