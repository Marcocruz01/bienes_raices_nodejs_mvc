import bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre: 'Marco Cruz',
        correo: 'marc01cruz2001@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    },
];

export default usuarios;