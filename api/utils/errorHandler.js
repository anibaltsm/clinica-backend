// Tipos de errores comunes
const ERROR_TYPES = {
  VALIDATION: 'ValidationError',
  AUTHENTICATION: 'AuthenticationError',
  AUTHORIZATION: 'AuthorizationError',
  NOT_FOUND: 'NotFoundError',
  DATABASE: 'DatabaseError',
  SERVER: 'ServerError'
};

// Mapeo de tipos de errores a códigos HTTP
const ERROR_STATUS_CODES = {
  [ERROR_TYPES.VALIDATION]: 400,
  [ERROR_TYPES.AUTHENTICATION]: 401,
  [ERROR_TYPES.AUTHORIZATION]: 403,
  [ERROR_TYPES.NOT_FOUND]: 404,
  [ERROR_TYPES.DATABASE]: 500,
  [ERROR_TYPES.SERVER]: 500
};

// Clase base para errores personalizados
class AppError extends Error {
  constructor(message, type = ERROR_TYPES.SERVER) {
    super(message);
    this.name = type;
    this.statusCode = ERROR_STATUS_CODES[type] || 500;
  }
}

// Función para manejar errores y enviar respuestas consistentes
const handleError = (error, res) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const errorType = error.name || ERROR_TYPES.SERVER;
  const message = error.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message
    }
  });
};

module.exports = {
  ERROR_TYPES,
  AppError,
  handleError
}; 