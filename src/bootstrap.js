module.exports = async () => {
  // Verificar si ya existen los roles
  const adminRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'admin' } });

  const clientRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'client' } });

  // Crear rol de administrador si no existe
  if (!adminRole) {
    await strapi
      .query('plugin::users-permissions.role')
      .create({
        data: {
          name: 'Administrador',
          description: 'Administrador de la clínica',
          type: 'admin',
          permissions: [
            {
              action: 'plugin::users-permissions.roles.create',
              enabled: true,
            },
            {
              action: 'plugin::users-permissions.roles.read',
              enabled: true,
            },
            {
              action: 'plugin::users-permissions.roles.update',
              enabled: true,
            },
            {
              action: 'plugin::users-permissions.roles.delete',
              enabled: true,
            },
          ],
        },
      });
  }

  // Crear rol de cliente si no existe
  if (!clientRole) {
    await strapi
      .query('plugin::users-permissions.role')
      .create({
        data: {
          name: 'Cliente',
          description: 'Cliente de la clínica',
          type: 'client',
          permissions: [
            {
              action: 'plugin::users-permissions.roles.read',
              enabled: true,
            },
          ],
        },
      });
  }
}; 