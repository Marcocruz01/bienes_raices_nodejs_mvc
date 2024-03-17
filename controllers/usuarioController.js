import {check, validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarId, generarJWT } from '../helpers/token.js';
import { emailOlvidePassword, emailRegistro } from '../helpers/emails.js';

// iniciar sesion - solo formulario
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Inicia Sesión',
        csrfToken: req.csrfToken(),
    });
}

// funcion de autenticar usuario
const autenticar = async (req, res) => {
    // validar campos de login
    await check('correo').isEmail().withMessage('El correo eléctronico es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);
    let resultado = validationResult(req);
    // verificar que el resultado del array este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            // Mostrar errores
            errores: resultado.array(),
        });
    }

    const {correo, password} = req.body;
    // comprobar si el usuario existe o si esta comprobada su cuenta
    const usuario = await Usuario.findOne({where: {correo}});
    if(!usuario || !usuario.confirmado) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            // Mostrar errores
            errores: [{msg: 'El usuario no existe o la cuenta no a sido verificada'}],
        });
    }
    // revisar la contraseña si esta correcta - usuario revisar
    if(!usuario.verificarPassword(password)) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            // Mostrar errores
            errores: [{msg: 'La contraseña de esta cuenta no coincide con la ingresada'}]
        });
    }

    // autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});
    // almacenar en un cookie el JWT
    return res.cookie('_jwt', token, {
        httpOnly: true,
        // expires
        // secure: true
    }).redirect('/mis-propiedades');
    
}

const cerrarSesion = async (req, res) => {
    return res.clearCookie('_jwt').status(200).redirect('/auth/login');
}

// formulario de registro
const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
}

// registrar cuenta
const registrar = async (req, res) =>  {
    // validacion de campos de entrada
    // await check('nombre').noEmpty().run(req);
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('correo').isEmail().withMessage('El correo eléctronico es obligatorio').run(req);
    await check('password').isLength({min: 6}).withMessage('Tu contraseña debe contener al menos 8 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Asegurate de que las contraseñas coincidan.').run(req);
    let resultado = validationResult(req);
    // verificar que el resultado del array este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            // Mostrar errores
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                correo: req.body.correo,
            }
        });
    }
    // extraer los datos
    const {nombre, correo, password} = req.body;
    // verificar que el email no halla duplucados
    const existeEmail = await Usuario.findOne({where: {correo}});
    // mostrar alerta
    if(existeEmail) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            // Mostrar errores
            errores: [{msg: 'El correo eléctronico ya se encuentra en uso, intenta con otro'}],
            usuario: {
                nombre: req.body.nombre,
                correo: req.body.correo,
           }
        });
    }
    
    // almacenar al usuario
    const usuario = await Usuario.create({
        nombre,
        correo,
        password,
        token: generarId() // Mandamos a llamar la funcion
    });

    // Envia el email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        correo: usuario.correo,
        token: usuario.token

    });

    // Mostrar mensaje de confirmacion y renderizar la vista
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Te haz registrado con exito, hemos enviado un correo de confirmacion a tu cuenta'
    })
}

// funcion que comprueba una cuenta
const confirmar = async(req, res, next) => {
    const {token} = req.params;
    // verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}});
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al Confirmar',
            mensaje: 'Hubo un error al confirmar tu cuenta, intentalo de nuevo !',
            error: true
        });
    }

    // Confirmar cuenta si todo esta OK
    // console.log(usuario.nombre);
    usuario.token = null; // ELiminar el token
    usuario.confirmado = true; // Confirmar al usuario
    await usuario.save(); // Guardar los cambios
    res.render('auth/confirmar-cuenta', {
       pagina: 'Cuenta Confirmada',
       mensaje: 'Tu cuenta a sido confirmada correctamente'
    });

}

// registrarte
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso en Bienes Raices',
        csrfToken: req.csrfToken(),
    });
}

const resetPassword = async (req, res) => {
    // validacion de campos de entrada
    // await check('nombre').noEmpty().run(req);
    await check('correo').isEmail().withMessage('El correo eléctronico es obligatorio').run(req);
    let resultado = validationResult(req);
    // verificar que el resultado del array este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso en Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }
    // si todo esta bien - buscar al usuario
    const { correo } = req.body;
    const usuario = await Usuario.findOne({where: {correo}});
    // si no existe el ususario mandar mensaje de error
    if(!usuario) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso en Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'No encontramos ningun usuario registrado con el correo eléctronico que ingresaste, intenta de nuevo'}]
        });
    }
    // generar un token y enviar en email de confirmacion
    usuario.token = generarId();
    await usuario.save();
    // enviar el email 
    emailOlvidePassword({
        correo: usuario.correo,
        nombre: usuario.nombre,
        token: usuario.token
    });
    // Renderizar una vista con un mensaje
    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones para restablecer tu password'
    });
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({where: {token}});
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu password',
            mensaje: 'Hubo un error al validar el token',
            error: true
        });
    }
    // si el usuario si el valido - mostrar el formulario para modificar la contraseña
    res.render('auth/reset-password', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken(),
    });

}

const nuevoPassword = async (req, res) => {
    // validar el password
    await check('password').isLength({min: 6}).withMessage('Tu contraseña debe contener al menos 8 caracteres').run(req);
    let resultado = validationResult(req);
    if(!resultado.isEmpty()) {
        // mostrar error
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }
    const {token} = req.params;
    const {password} = req.body;
    // identificar al propietario del cambio
    const usuario = await Usuario.findOne({where: {token}});
    // hashear el password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash( password, salt);
    // guardar cambios
    usuario.token = null;
    await usuario.save();
    // renderizar una vista
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Resatblecido',
        mensaje: 'El password fue actualizado correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}