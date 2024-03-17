import express from 'express';
import {body} from 'express-validator';
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarEdicion, eliminar, modificarEstado, mostrarPropiedad, enviarMensaje, verMensajes} from '../controllers/propiedadController.js';
import protejerRuta from '../middleware/protejerRuta.js';
import upload from '../middleware/subirImagen.js';
import { identificarUsuario } from '../middleware/identificarUsuario.js';
const router = express.Router();

// vista principal
router.get('/mis-propiedades', protejerRuta, admin);
// crear propiedades
router.get('/propiedades/crear', protejerRuta, crear);
router.post('/propiedades/crear', protejerRuta, 
    body('titulo').notEmpty().withMessage('El titulo no debe de ir vacio'),
    body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacia'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona una rango de Precios'),
    body('habitaciones').notEmpty().withMessage('Selecciona el numero de habitaciones'),
    body('estacionamiento').notEmpty().withMessage('Selecciona el numero de estacionamientos'),
    body('wc').notEmpty().withMessage('Selecciona el numero de baños'),
    body('lat').notEmpty().withMessage('Ubica una propidad en el mapa'),
    guardar
);

// subir imagen
router.get('/propiedades/agregar-imagen/:id', protejerRuta, agregarImagen);
router.post('/propiedades/agregar-imagen/:id', protejerRuta, upload.single('imagen'), almacenarImagen);

// editar informacion
router.get('/propiedades/editar/:id', protejerRuta, editar);
router.post('/propiedades/editar/:id', protejerRuta, 
    body('titulo').notEmpty().withMessage('El titulo no debe de ir vacio'),
    body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacia'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona una rango de Precios'),
    body('habitaciones').notEmpty().withMessage('Selecciona el numero de habitaciones'),
    body('estacionamiento').notEmpty().withMessage('Selecciona el numero de estacionamientos'),
    body('wc').notEmpty().withMessage('Selecciona el numero de baños'),
    body('lat').notEmpty().withMessage('Ubica una propidad en el mapa'),
    guardarEdicion
);

// Eliminar propiedad
router.post('/propiedades/eliminar/:id', protejerRuta, eliminar);

// Modificar estado de la propiedad
router.put('/propiedades/:id', protejerRuta, modificarEstado);

// Area publica que cualquier usuario podra ver
router.get('/propiedad/:id', identificarUsuario, mostrarPropiedad);

// ALmacenar los mensajes enviados
router.post('/propiedad/:id', identificarUsuario, body('mensaje').isLength({min: 15}).withMessage('El mensaje debe contener 15 caracteres para poder enviar'), enviarMensaje);

// ver los mensajes recividos
router.get('/mensajes/:id', protejerRuta, verMensajes);


export default router