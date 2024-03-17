import { unlink } from 'node:fs/promises';
import { validationResult } from 'express-validator';
import {Precio, Categoria, Propiedad, Mensaje, Usuario} from '../models/index.js';
import {esVendedor, formatearFecha} from '../helpers/index.js';


const admin = async(req, res) => {
    // leer QueryString
    const { pagina: paginaActual } = req.query;
    // expresion regular
    const expresionRegular = /^[0-9]$/;
    if(!expresionRegular.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1'); 
    }
    try {
        // extraer el usuario id
        const { id } = req.usuario;
        //  Limites y offset para el paginador
        const limit = 5; // paginar de 10 en 10 registros 
        const offset = ((paginaActual * limit) - limit);
        // consulta para traernos las propiedades
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {usuarioId: id},
                include: [
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Mensaje, as :'mensajes'}
                ]
            }),
            Propiedad.count({
                where: {usuarioId: id}
            })
        ]);
        
        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        });
    } catch (error) {
        console.log(error);
    }
}

// formulario para crera una nueva propiedad
const crear = async (req, res) => {
    // consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);
    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    });
}

const guardar = async(req, res) => {
    // validar los campos 
    let resultado = validationResult(req);
    if(!resultado.isEmpty()) {
        // consultar modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }
    // la validacion paso correctamente - registramos propiedad
    const {titulo, descripcion, habitaciones, wc, estacionamiento, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;
    const { id: usuarioId } = req.usuario;
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            wc,
            estacionamiento,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        });
        const {id} = propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error);
    }
}

const agregarImagen = async (req, res) => {
    //  validar que la propiedad exista 
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // Que la propiedad no esta publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }
    // Validar que la propiedad pertenezca al usuario que la eta creando 
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }
    res.render('propiedades/agregar-imagen', {
        pagina: `Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    });
}

// almacenar las imagenes
const almacenarImagen = async (req, res, next) => {
    //  validar que la propiedad exista 
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // Que la propiedad no esta publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }
    // Validar que la propiedad pertenezca al usuario que la eta creando 
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }
    res.render('propiedades/agregar-imagen', {
        pagina: `Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    });

    try {
        // almacenar la imagen 
        console.log(req.file);
        propiedad.imagen = req.file.filename;
        // publicar la propiedad - finalizar post
        propiedad.publicado = 1;
        // guardar cambios
        await propiedad.save();
        next();
    } catch (error) {
        console.log(error);
    }
}

const editar = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    // consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);
    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad,
    });
}

const guardarEdicion = async (req, res) => {
    // verificar validacion de campos de formulario
    let resultado = validationResult(req);
    if(!resultado.isEmpty()) {
        // consultar modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/editar', {
            pagina: `Editar Propiedad`,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body, // reescribimos la ultima copia 
        });
    }
    // extraer el ID
    const { id } = req.params;
    // validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    // Reescribir y actualizar el objeto de propiedad
    try {
        // la validacion paso correctamente - registramos propiedad
        const {titulo, descripcion, habitaciones, wc, estacionamiento, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        });
        await propiedad.save();
        //redireccionar despues de guardar
        res.redirect('/mis-propiedades');
    } catch (error) {
        console.log(error);
    }
}

const eliminar = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    // Eliminar la imagen del Disco duro
    await unlink(`public/uploads/${propiedad.imagen}`);
    // Eliminar por completo la propiedad
    await propiedad.destroy();
    // redireccionar 
    res.redirect('/mis-propiedades');
}

// cambiar el estado de la propiedad
const modificarEstado = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
    // revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    // Actualizar la propiedad
    propiedad.publicado = propiedad.publicado ? 0 : 1;
    // propiedad.publicado = !propiedad.publicado;
    await propiedad.save();
    res.json({
        resultado: 'okay'
    });

}


// mostrar propiedades
const mostrarPropiedad = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // comprobar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' }, 
            { model: Categoria, as: 'categoria' }
        ]
    });

    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }
    
    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)

    });
}

const enviarMensaje = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // comprobar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Precio, as: 'precio'
            }, 
            {
                model: Categoria, as: 'categoria'
            }
        ]
    });

    // renderizar los errores en caso de tener
    let resultado = validationResult(req);
    if(!resultado.isEmpty()) {
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        });
    }

    const { mensaje } = req.body;
    const { id: propiedadId} = req.params;
    const { id: usuarioId} = req.usuario;

    // Almacenar mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId

    });
    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
    });
}

// leer mensajes recibidos
const verMensajes = async (req, res) => {
    // extraer el ID
    const { id } = req.params;
    // validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'},
                ],
            },
        ],
    });
    if(!propiedad) {
        return res.redirect('/');
    }
    // revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/');
    }
    // renderizar la vista 
    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha

    });
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarEdicion,
    eliminar,
    modificarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
}