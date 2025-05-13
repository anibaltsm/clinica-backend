const { query } = require('../config/db');
const { hashPassword, generateToken } = require('../utils/auth');
const { validateRegisterData } = require('../utils/validators');
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
    const userData = req.body;
    
    // Validar datos de registro
    validateRegisterData(userData);
    
    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [userData.email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new AppError('El email ya está registrado', ERROR_TYPES.VALIDATION);
    }
    
    // Encriptar la contraseña
    const hashedPassword = await hashPassword(userData.password);
    
    // Crear el nuevo usuario en la base de datos
    const result = await query(
      `INSERT INTO usuarios (
        email, 
        password, 
        nombre, 
        apellido, 
        telefono,
        rol,
        fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, nombre, apellido, rol`,
      [
        userData.email,
        hashedPassword,
        userData.nombre,
        userData.apellido,
        userData.telefono || null,
        userData.rol || 'paciente'
      ]
    );
    
    const newUser = result.rows[0];
    
    // Generar token de autenticación
    const token = generateToken(newUser);
    
    // Responder con los datos del usuario y el token
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          rol: newUser.rol
        },
        token
      }
    });
  } catch (error) {
    return handleError(error, res);
  }
}; 