const { ERROR_TYPES, AppError } = require('./errorHandler');

// Validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar fortaleza de contraseña
const isStrongPassword = (password) => {
  // Al menos 8 caracteres, una letra mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
  return passwordRegex.test(password);
};

// Validar datos para registro
const validateRegisterData = (data) => {
  const { email, password, nombre, apellido } = data;

  if (!email || !password || !nombre || !apellido) {
    throw new AppError('Todos los campos son obligatorios', ERROR_TYPES.VALIDATION);
  }

  if (!isValidEmail(email)) {
    throw new AppError('El formato del email no es válido', ERROR_TYPES.VALIDATION);
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número',
      ERROR_TYPES.VALIDATION
    );
  }

  return true;
};

// Validar datos para inicio de sesión
const validateLoginData = (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Email y contraseña son obligatorios', ERROR_TYPES.VALIDATION);
  }

  if (!isValidEmail(email)) {
    throw new AppError('El formato del email no es válido', ERROR_TYPES.VALIDATION);
  }

  return true;
};

// Validar datos para recuperación de contraseña
const validateRecoveryData = (data) => {
  const { email } = data;

  if (!email) {
    throw new AppError('El email es obligatorio', ERROR_TYPES.VALIDATION);
  }

  if (!isValidEmail(email)) {
    throw new AppError('El formato del email no es válido', ERROR_TYPES.VALIDATION);
  }

  return true;
};

// Validar datos para cambio de contraseña
const validatePasswordChangeData = (data) => {
  const { password, confirmPassword } = data;

  if (!password || !confirmPassword) {
    throw new AppError('Todos los campos son obligatorios', ERROR_TYPES.VALIDATION);
  }

  if (password !== confirmPassword) {
    throw new AppError('Las contraseñas no coinciden', ERROR_TYPES.VALIDATION);
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número',
      ERROR_TYPES.VALIDATION
    );
  }

  return true;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  validateRegisterData,
  validateLoginData,
  validateRecoveryData,
  validatePasswordChangeData
}; 