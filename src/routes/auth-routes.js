/**
 * Modulo: routes/auth-routes.js
 * Proposito: definir las rutas (URL + metodo HTTP) del servicio de autenticacion
 * y asociar cada una con su funcion en el controlador.
 *
 * Rutas (se montan bajo el prefijo /api en app.js):
 *   POST /api/register -> registrarUsuario
 *   POST /api/login    -> iniciarSesion
 */
import { Router } from 'express';
import { registrarUsuario, iniciarSesion } from '../controllers/auth-controller.js';

const router = Router();

// Registro: crea un usuario nuevo
router.post('/register', registrarUsuario);

// Inicio de sesion: valida usuario y contrasena
router.post('/login', iniciarSesion);

export default router;
