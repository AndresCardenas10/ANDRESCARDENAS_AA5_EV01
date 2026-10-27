/**
 * Modulo: config/database.js
 * Proposito: crear el "pool" de conexiones a MySQL/MariaDB.
 *
 * Un pool mantiene varias conexiones abiertas y las reutiliza, en lugar de
 * abrir y cerrar una conexion por cada peticion. Los datos de conexion se
 * leen del archivo .env (cargado en server.js con dotenv).
 */
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aa5_ev01_auth',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
