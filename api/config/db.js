const { Pool } = require('pg');

// Configuración de la conexión a la base de datos usando variables de entorno
const pool = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Función para ejecutar consultas
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Consulta ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool
}; 