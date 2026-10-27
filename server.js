/**
 * Archivo: server.js
 * Proposito: punto de entrada. Carga la configuracion, verifica la conexion
 * a la base de datos y enciende el servidor web.
 *
 * Ejecucion: npm start
 */

// IMPORTANTE: debe ser el primer import, para que las variables de .env
// ya esten cargadas cuando los demas modulos las lean.
import 'dotenv/config';

import app from './src/app.js';
import pool from './src/config/database.js';

const PORT = Number(process.env.PORT) || 3000;

// 1. Verificar la base de datos antes de aceptar peticiones
try {
  const conexion = await pool.getConnection();
  conexion.release();
  console.log('Conexion a la base de datos: OK');
} catch (error) {
  console.error('No se pudo conectar a la base de datos.');
  console.error(`Detalle: ${error.code || error.message}`);
  console.error(
    'Revise que MySQL este iniciado en XAMPP, que la base aa5_ev01_auth exista y que los datos del archivo .env sean correctos.'
  );
  process.exit(1);
}

// 2. Encender el servidor
const servidor = app.listen(PORT);

// Evento "listening": el servidor ya esta recibiendo peticiones
servidor.once('listening', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Evento "error": el mas frecuente es que el puerto ya este ocupado por otro programa
// o por otra copia del servidor que sigue abierta
servidor.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya esta en uso. Cierre el otro servidor o cambie PORT en el archivo .env.`);
  } else {
    console.error('No se pudo iniciar el servidor:', error.message);
  }
  process.exit(1);
});
