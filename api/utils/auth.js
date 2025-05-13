const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Número de rondas de cifrado para bcrypt
const SALT_ROUNDS = 10;

// Función para generar un hash de la contraseña
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Función para comparar contraseñas
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Función para generar un token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
  };

  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Función para verificar un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Middleware para verificar el token JWT
const requireAuth = (req, res) => {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return { 
        authenticated: false, 
        error: 'No se proporcionó token de autenticación' 
      };
    }

    // Formatear el token (quitar "Bearer " si está presente)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Verificar el token
    const decoded = verifyToken(token);
    
    // Si llegamos hasta aquí, el token es válido
    return { 
      authenticated: true, 
      user: decoded 
    };
  } catch (error) {
    return { 
      authenticated: false, 
      error: error.message 
    };
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  requireAuth
}; 