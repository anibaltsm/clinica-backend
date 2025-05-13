const { requireAuth } = require('../utils/auth');
const { handleError } = require('../utils/errorHandler');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar las solicitudes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verificar que sea una solicitud GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: {
        type: 'MethodNotAllowed',
        message: 'Método no permitido' 
      }
    });
  }

  try {
    // Verificar el token
    const authResult = requireAuth(req, res);
    
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AuthenticationError',
          message: authResult.error
        }
      });
    }

    // Responder con los datos del usuario
    return res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          role: authResult.user.role
        }
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
}; 