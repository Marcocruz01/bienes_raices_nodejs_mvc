import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const identificarUsuario = async (req, res, next) => {
    // identificar si hay un token 
    const {_jwt} = req.cookies;
    if(!_jwt) {
        req.usuario = null;
        return next();
    }
    // Comprobar token
    try {
        const decoded = jwt.verify(_jwt, process.env.JWT_KEY);
        // identificar al usuario
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);
        // almacenar al usuario en reques
        if(usuario) {
            req.usuario = usuario;
        }
        return next(); // si entra al middleware y despues pasamos al siguiente middleware
    } catch (error) {
        console.log(error);
        return res.clearCookie('_jwt').redirect('/auth/login');
    }
}

export {
    identificarUsuario
}