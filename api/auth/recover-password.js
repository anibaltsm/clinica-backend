const { query } = require('../config/db');
const { validateRecoveryData } = require('../utils/validators');
const { handleError, AppError, ERROR_TYPES } = require('../utils/errorHandler');
const crypto = require('crypto');

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
    const { email } = req.body;
    
    // Validar datos de recuperación
    validateRecoveryData({ email });
    
    // Buscar al usuario por email
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    // Si no encontramos al usuario, aún así respondemos positivamente para evitar enumeración de usuarios
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación'
      });
    }
    
    // Generar token de recuperación (código aleatorio de 6 dígitos)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // Actualizar el token de recuperación en la base de datos
    await query(
      `UPDATE usuarios 
       SET reset_token = $1, reset_token_expiry = $2
       WHERE email = $3`,
      [resetToken, resetTokenExpiry, email]
    );
    
    // En una aplicación real, aquí enviaríamos un email con el código
    // Por ahora, solo simulamos el envío y devolvemos el token en la respuesta
    // En producción, NO deberías devolver el token en la respuesta
    console.log(`Token de recuperación para ${email}: ${resetToken}`);
    
    // Responder exitosamente
    return res.status(200).json({
      success: true,
      message: 'Se ha enviado un código de recuperación a tu email',
      // SOLO PARA DESARROLLO - remover en producción
      data: {
        resetToken,
        expiry: resetTokenExpiry
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
}; 