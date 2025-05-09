// Serverless function for Vercel
const strapi = require('@strapi/strapi');
const path = require('path');

/**
 * This file is used to start Strapi in a serverless context
 * It depends on these environment variables:
 * - DATABASE_HOST
 * - DATABASE_PORT
 * - DATABASE_NAME
 * - DATABASE_USERNAME
 * - DATABASE_PASSWORD
 */

let app;

/**
 * Initialize Strapi for serverless environment
 */
async function initialize() {
  if (!app) {
    app = strapi({ 
      distDir: path.resolve(__dirname, '../dist'),
      serveAdminPanel: true
    });
    await app.load();
    await app.server.mount();
  }
  return app;
}

/**
 * Handle Vercel serverless function
 */
module.exports = async (req, res) => {
  try {
    const instance = await initialize();
    await instance.router.process(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}; 