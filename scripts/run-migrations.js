const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('Conectando a la base de datos...');
    const client = await pool.connect();
    
    try {
      // Leer y ejecutar el archivo SQL
      const sqlPath = path.join(__dirname, 'db_schema.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log('Ejecutando migraciones...');
      await client.query(sql);
      
      console.log('Migraciones completadas exitosamente.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar las migraciones
runMigrations(); 