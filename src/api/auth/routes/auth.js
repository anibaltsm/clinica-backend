module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/custom-register',
      handler: 'auth.register',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/custom-login',
      handler: 'auth.login',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'auth.me',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['api::auth.me'],
        },
      },
    },
    {
      method: 'POST',
      path: '/auth/forgot-password',
      handler: 'auth.forgotPassword',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      handler: 'auth.resetPassword',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/verify-email',
      handler: 'auth.verifyEmail',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/auth/profile',
      handler: 'auth.updateProfile',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['api::auth.profile'],
        },
      },
    },
  ],
}; 