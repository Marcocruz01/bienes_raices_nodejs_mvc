import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const protejerRuta = async (req, res, next) => {
    // verificar que si hay un token 
    const { _jwt } = req.cookies;
    if(!_jwt) {
        return res.redirect('/auth/login');
    }
    // comprobar el token
    try {
        const decoded = jwt.verify(_jwt, process.env.JWT_KEY);
        // identificar al usuario
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);
        // almacenar al usuario en reques
        if(usuario) {
            req.usuario = usuario;
        } else {
            return res.redirect('/auth/login');
        }
        return next(); // si entra al middleware y despues pasamos al siguiente middleware
    } catch (error) {
        return res.clearCookie('_jwt').redirect('/auth/login');
    }
}

export default protejerRuta