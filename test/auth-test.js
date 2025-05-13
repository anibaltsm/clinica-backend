const https = require('https');

// URL base para las pruebas (ajustar según el entorno)
const baseUrl = process.env.API_URL || 'https://clinica-backend-mvas5fe6e-anibals-projects-6b4be76e.vercel.app';

// Función para realizar solicitudes HTTP
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = JSON.stringify(data).length;
    }

    const url = `${baseUrl}${path}`;
    console.log(`Realizando solicitud ${method} a ${url}`);

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ 
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Prueba del endpoint de registro
async function testRegister() {
  console.log('\n--- Probando registro de usuario ---');
  
  const email = `test${Date.now()}@example.com`;
  const registerData = {
    email,
    password: 'Test123456',
    nombre: 'Usuario',
    apellido: 'Test',
    telefono: '1234567890'
  };

  try {
    const response = await request('POST', '/api/auth/register', registerData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Respuesta:', response.data);
    return response.data?.data?.token;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Prueba del endpoint de inicio de sesión
async function testLogin(email = 'admin@clinica.com', password = 'Admin123') {
  console.log('\n--- Probando inicio de sesión ---');
  
  try {
    const response = await request('POST', '/api/auth/login', { email, password });
    console.log(`Status: ${response.statusCode}`);
    console.log('Respuesta:', response.data);
    return response.data?.data?.token;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Prueba del endpoint de verificación de token
async function testVerify(token) {
  console.log('\n--- Probando verificación de token ---');
  
  if (!token) {
    console.log('No hay token para verificar');
    return;
  }

  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await request('GET', '/api/auth/verify');
    console.log(`Status: ${response.statusCode}`);
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Prueba del endpoint de recuperación de contraseña
async function testRecoverPassword(email = 'admin@clinica.com') {
  console.log('\n--- Probando recuperación de contraseña ---');
  
  try {
    const response = await request('POST', '/api/auth/recover-password', { email });
    console.log(`Status: ${response.statusCode}`);
    console.log('Respuesta:', response.data);
    return response.data?.data?.resetToken;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Prueba del endpoint de cambio de contraseña
async function testResetPassword(token, password = 'NuevaPass123') {
  console.log('\n--- Probando cambio de contraseña ---');
  
  if (!token) {
    console.log('No hay token para restablecer la contraseña');
    return;
  }

  try {
    const response = await request('POST', '/api/auth/reset-password', {
      token,
      password,
      confirmPassword: password
    });
    console.log(`Status: ${response.statusCode}`);
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  try {
    // Registrar un nuevo usuario
    const registerToken = await testRegister();
    
    // Probar la verificación del token de registro
    await testVerify(registerToken);
    
    // Iniciar sesión
    const loginToken = await testLogin();
    
    // Probar la verificación del token de inicio de sesión
    await testVerify(loginToken);
    
    // Probar la recuperación de contraseña
    const resetToken = await testRecoverPassword();
    
    // Probar el cambio de contraseña
    if (resetToken) {
      await testResetPassword(resetToken);
      
      // Probar iniciar sesión con la nueva contraseña
      await testLogin('admin@clinica.com', 'NuevaPass123');
    }
    
    console.log('\nPruebas completadas!');
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests(); 