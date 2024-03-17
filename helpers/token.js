import jwt from 'jsonwebtoken';

// autenticar al usuario
const generarJWT = (datos) => jwt.sign({id: datos.id, nombre: datos.nombre}, process.env.JWT_KEY, {expiresIn: '1d'});
// generar id random
const generarId = () => Date.now().toString(32) + Math.random().toString(32).substring(2);

export {
    generarId,
    generarJWT
}