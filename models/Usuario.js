import {DataTypes} from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const Usuario = db.define('usuarios', {
    nombre: {
        type: DataTypes.STRING('32'),
        allowNull: null
    },
    correo: {
        type: DataTypes.STRING('32'),
        allowNull: null
    },
    password: {
        type: DataTypes.STRING('200'),
        allowNull: null
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
}, {
    hooks: {
        beforeCreate: async function(usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    },
    scopes: {
        eliminarPassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
});

// metodo personalizado  - comprobar el password
Usuario.prototype.verificarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

export default Usuario;