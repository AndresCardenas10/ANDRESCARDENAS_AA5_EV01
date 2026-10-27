/**
 * Modulo: app.js
 * Proposito: crear y configurar la aplicacion Express (sin encenderla).
 * El servidor se enciende en server.js, asi la aplicacion queda separada y
 * facil de probar.
 */
import express from 'express';
import authRoutes from './routes/auth-routes.js';

const app = express();

// Convierte el cuerpo JSON de las peticiones en un objeto disponible en req.body
app.use(express.json());

// Ruta de comprobacion: sirve para verificar desde el navegador que el servicio esta activo
app.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Servicio web de registro e inicio de sesion activo',
    endpoints: ['POST /api/register', 'POST /api/login'],
  });
});

// Rutas del servicio de autenticacion
app.use('/api', authRoutes);

// Ruta no encontrada (cualquier URL que no exista)
app.use((req, res) => {
  res.status(404).json({ exito: false, mensaje: 'Ruta no encontrada' });
});

// Manejador de errores general (debe ir al final y recibir 4 parametros)
app.use((error, req, res, next) => {
  // JSON mal escrito en el cuerpo de la peticion
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ exito: false, mensaje: 'El cuerpo de la peticion no es un JSON valido' });
  }

  console.error('Error no controlado:', error);
  return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
});

export default app;
