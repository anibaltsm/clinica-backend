// Middleware to handle authentication and public endpoints
export default async function middleware(req) {
  // Get the pathname
  const url = new URL(req.url);
  const path = url.pathname;

  // Allow access to healthcheck without authentication
  if (path === '/api/healthcheck') {
    return new Response(null, {
      status: 200,
      headers: {
        'x-middleware-next': '1',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // Continue to the next middleware or endpoint handler
  return new Response(null, {
    status: 200,
    headers: {
      'x-middleware-next': '1'
    }
  });
} 