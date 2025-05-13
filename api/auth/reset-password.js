const { query } = require('../config/db');
const { hashPassword } = require('../utils/auth');
const { validatePasswordChangeData } = require('../utils/validators');
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
    const { token, password, confirmPassword } = req.body;
    
    if (!token) {
      throw new AppError('Token requerido', ERROR_TYPES.VALIDATION);
    }
    
    // Validar datos de cambio de contraseña
    validatePasswordChangeData({ password, confirmPassword });
    
    // Buscar al usuario por token
    const result = await query(
      `SELECT * FROM usuarios 
       WHERE reset_token = $1 
       AND reset_token_expiry > NOW()`,
      [token]
    );
    
    // Verificar si el token es válido
    if (result.rows.length === 0) {
      throw new AppError('Token inválido o expirado', ERROR_TYPES.VALIDATION);
    }
    
    const user = result.rows[0];
    
    // Encriptar la contraseña
    const hashedPassword = await hashPassword(password);
    
    // Actualizar la contraseña y eliminar el token de recuperación
    await query(
      `UPDATE usuarios 
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );
    
    // Responder exitosamente
    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    return handleError(error, res);
  }
}; 