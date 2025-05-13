const { query } = require('../config/db');
const { comparePassword, generateToken } = require('../utils/auth');
const { validateLoginData } = require('../utils/validators');
const { handleError, AppError, ERROR_TYPES } = require('../utils/errorHandler');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar las solicitudes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verificar que sea una solicitud POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: {
        type: 'MethodNotAllowed',
        message: 'Método no permitido' 
      }
    });
  }

  try {
    // Obtener datos del cuerpo de la solicitud
    const { email, password } = req.body;
    
    // Validar datos de inicio de sesión
    validateLoginData({ email, password });
    
    // Buscar al usuario por email
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      throw new AppError('Credenciales inválidas', ERROR_TYPES.AUTHENTICATION);
    }
    
    const user = result.rows[0];
    
    // Verificar la contraseña
    const passwordMatch = await comparePassword(password, user.password);
    
    if (!passwordMatch) {
      throw new AppError('Credenciales inválidas', ERROR_TYPES.AUTHENTICATION);
    }
    
    // Generar token de autenticación
    const token = generateToken(user);
    
    // Responder con los datos del usuario y el token
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol
        },
        token
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
}; 