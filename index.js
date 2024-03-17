// importar 
import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';
// crear la app y la mandamos a llamar
const app = express();
// habilitar lectura de datos de formulario auth
app.use(express.urlencoded({extended: true}));
// habilitar cookie parser
app.use( cookieParser());
// habilitar el CSRF
app.use( csrf({cookie: true}));
// conexion a la base de datos
try {
    await db.authenticate();
    db.sync(); // crea la tabla si no existe
    console.log('Conexion correcta a la base de datos');
} catch (error) {
    console.log(error);
}
// habilitar Pug - Renderizar los archivos
app.set('view engine', 'pug');
app.set('views', './views');
// carpeta publica
app.use(express.static('public'));
// routing
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);
// definir un puerto y arrancar
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`);
});