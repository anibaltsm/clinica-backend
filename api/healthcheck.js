// Simple health check endpoint completely independent from Strapi
module.exports = (req, res) => {
  // Set CORS headers to allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return health status
  res.status(200).json({
    status: 'ok',
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    deployment: 'Vercel'
  });
}; 