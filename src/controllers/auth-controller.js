/**
 * Modulo: controllers/auth-controller.js
 * Proposito: logica del registro y del inicio de sesion.
 *
 * Reglas del servicio:
 *   - Recibe un JSON con los campos "usuario" y "contrasena".
 *   - La contrasena nunca se guarda en texto plano: se guarda su hash (bcrypt).
 *   - Si la autenticacion es correcta responde "Autenticación satisfactoria".
 *   - Si no lo es responde "Error en la autenticación".
 *
 * Todas las respuestas tienen la forma: { exito: true|false, mensaje: "..." }
 */
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

// ---------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------
const SALT_ROUNDS = 10; // "costo" del hash: mas alto = mas seguro pero mas lento
const LONGITUD_MAXIMA_USUARIO = 50; // debe coincidir con VARCHAR(50) de la tabla
const LONGITUD_MINIMA_CONTRASENA = 6;
const BYTES_MAXIMOS_CONTRASENA = 72; // bcrypt solo toma en cuenta los primeros 72 bytes

const MENSAJE_AUTENTICACION_OK = 'Autenticación satisfactoria';
const MENSAJE_AUTENTICACION_ERROR = 'Error en la autenticación';
const MENSAJE_ERROR_SERVIDOR = 'Error interno del servidor';

// ---------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------

/**
 * Toma del cuerpo de la peticion los campos usuario y contrasena.
 * El usuario se limpia de espacios al inicio y al final; la contrasena no se
 * modifica porque los espacios podrian ser parte de ella.
 * Devuelve null si alguno falta, no es texto o esta vacio.
 */
function extraerCredenciales(cuerpo) {
  const { usuario, contrasena } = cuerpo ?? {};

  if (typeof usuario !== 'string' || typeof contrasena !== 'string') {
    return null;
  }

  const usuarioLimpio = usuario.trim();
  if (usuarioLimpio === '' || contrasena === '') {
    return null;
  }

  return { usuario: usuarioLimpio, contrasena };
}

/**
 * Valida las reglas del registro.
 * Devuelve un texto con el problema encontrado, o null si todo esta bien.
 */
function validarDatosRegistro({ usuario, contrasena }) {
  if (usuario.length > LONGITUD_MAXIMA_USUARIO) {
    return `El usuario no puede superar los ${LONGITUD_MAXIMA_USUARIO} caracteres`;
  }
  if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    return `La contrasena debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`;
  }
  if (Buffer.byteLength(contrasena, 'utf8') > BYTES_MAXIMOS_CONTRASENA) {
    return 'La contrasena es demasiado larga';
  }
  return null;
}

// ---------------------------------------------------------------------
// POST /api/register
// ---------------------------------------------------------------------
export async function registrarUsuario(req, res) {
  const credenciales = extraerCredenciales(req.body);

  if (!credenciales) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Debe enviar usuario y contrasena',
    });
  }

  const problema = validarDatosRegistro(credenciales);
  if (problema) {
    return res.status(400).json({ exito: false, mensaje: problema });
  }

  try {
    // Se guarda el hash, nunca la contrasena original
    const hash = await bcrypt.hash(credenciales.contrasena, SALT_ROUNDS);

    // Los "?" son parametros: evitan la inyeccion SQL
    await pool.execute('INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)', [
      credenciales.usuario,
      hash,
    ]);

    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado correctamente',
    });
  } catch (error) {
    // ER_DUP_ENTRY: ya existe un usuario con ese nombre (restriccion UNIQUE)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ exito: false, mensaje: 'El usuario ya existe' });
    }

    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ exito: false, mensaje: MENSAJE_ERROR_SERVIDOR });
  }
}

// ---------------------------------------------------------------------
// POST /api/login
// ---------------------------------------------------------------------
export async function iniciarSesion(req, res) {
  const credenciales = extraerCredenciales(req.body);

  if (!credenciales) {
    return res.status(400).json({
      exito: false,
      mensaje: `${MENSAJE_AUTENTICACION_ERROR}: debe enviar usuario y contrasena`,
    });
  }

  try {
    // 1. Buscar el usuario y traer su hash guardado
    const [filas] = await pool.execute(
      'SELECT contrasena FROM usuarios WHERE usuario = ? LIMIT 1',
      [credenciales.usuario]
    );

    // 2. Si no existe, se responde igual que con contrasena incorrecta
    //    (asi no se revela cuales usuarios existen)
    if (filas.length === 0) {
      return res.status(401).json({ exito: false, mensaje: MENSAJE_AUTENTICACION_ERROR });
    }

    // 3. Comparar la contrasena enviada con el hash guardado
    const coincide = await bcrypt.compare(credenciales.contrasena, filas[0].contrasena);

    if (!coincide) {
      return res.status(401).json({ exito: false, mensaje: MENSAJE_AUTENTICACION_ERROR });
    }

    // 4. Todo correcto
    return res.status(200).json({ exito: true, mensaje: MENSAJE_AUTENTICACION_OK });
  } catch (error) {
    console.error('Error al iniciar sesion:', error);
    return res.status(500).json({ exito: false, mensaje: MENSAJE_ERROR_SERVIDOR });
  }
}
