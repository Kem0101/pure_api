import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectionDB from './config/database';
import userRoutes from './routes/user';
import publicationRoutes from './routes/publication';
import bodyParser from 'body-parser';
import messageRoutes from './routes/message';
import followRoutes from './routes/follow';

const app = express();
dotenv.config(); // dotenv para configurar variables de entornos
conectionDB(); // llamando a la función que hace la conexion con la base de datos en database.ts

// CORS
// Configurar cabeceras y cors
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cargando rutas
// // Rutas
app.use('/api', userRoutes);
app.use('/api', publicationRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);
app.use('/api', followRoutes);

// Levantando el servidor en el puerto x
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
