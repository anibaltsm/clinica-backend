module.exports = {
  cors: {
    enabled: true,
    origin: ['*'],
    headers: ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    keepHeaderOnError: true,
  },
  xframe: {
    enabled: true,
    value: 'SAMEORIGIN',
  },
  hsts: {
    enabled: true,
    maxAge: 31536000,
    includeSubDomains: true,
  },
  xss: {
    enabled: true,
    mode: 'block',
  },
  csp: {
    enabled: true,
    policy: ['block-all-mixed-content'],
  },
  p3p: {
    enabled: false,
    value: '',
  },
  xssFilter: {
    enabled: true,
    mode: 'block',
  },
  poweredBy: {
    enabled: false,
    value: 'Strapi <strapi.io>',
  },
}; 