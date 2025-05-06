const crypto = require('crypto');

module.exports = {
  async register(ctx) {
    const { email, password, username, nombre, apellido, telefono } = ctx.request.body;

    try {
      // Verificar si el usuario ya existe
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (existingUser) {
        return ctx.badRequest('El email ya está registrado');
      }

      // Obtener el rol autenticado
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (!authenticatedRole) {
        return ctx.badRequest('Rol autenticado no encontrado');
      }

      // Crear el nuevo usuario
      const newUser = await strapi.service('plugin::users-permissions.user').add({
        username: username || email,
        email,
        password,
        nombre,
        apellido,
        telefono,
        provider: 'local',
        confirmed: true,
        role: authenticatedRole.id,
      });

      // Generar el JWT
      const jwt = strapi.service('plugin::users-permissions.jwt').issue({
        id: newUser.id,
      });

      // Sanitizar usuario para la respuesta
      const sanitizedUser = await this.sanitizeUser(newUser);

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (error) {
      console.error('Error en registro:', error);
      return ctx.badRequest(`Error en registro: ${error.message}`);
    }
  },

  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    try {
      // Buscar el usuario
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { 
          $or: [
            { email: identifier },
            { username: identifier },
          ],
        },
      });

      if (!user) {
        return ctx.badRequest('Usuario no encontrado');
      }

      // Validar la contraseña
      const validPassword = await strapi.service('plugin::users-permissions.user').validatePassword(
        password,
        user.password
      );

      if (!validPassword) {
        return ctx.badRequest('Contraseña incorrecta');
      }

      // Generar el JWT
      const jwt = strapi.service('plugin::users-permissions.jwt').issue({
        id: user.id,
      });

      const sanitizedUser = await this.sanitizeUser(user);

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (error) {
      console.error('Error en login:', error);
      return ctx.badRequest(`Error en login: ${error.message}`);
    }
  },

  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('No autorizado');
    }

    try {
      // Obtener usuario completo con relaciones
      const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: { role: true },
      });

      const sanitizedUser = await this.sanitizeUser(fullUser);
      return ctx.send(sanitizedUser);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return ctx.badRequest(`Error al obtener perfil: ${error.message}`);
    }
  },

  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    try {
      // Buscar el usuario
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (!user) {
        return ctx.badRequest('Usuario no encontrado');
      }

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(64).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hora

      // Actualizar usuario con token
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        },
      });

      // Enviar email
      try {
        await strapi.plugins['email'].services.email.send({
          to: email,
          subject: 'Recuperación de contraseña',
          text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: 
          ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
          html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}">Restablecer contraseña</a></p>`,
        });
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
      }

      return ctx.send({ message: 'Se ha enviado un email con las instrucciones' });
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      return ctx.badRequest(`Error en recuperación de contraseña: ${error.message}`);
    }
  },

  async resetPassword(ctx) {
    const { token, password, passwordConfirmation } = ctx.request.body;

    if (!token) {
      return ctx.badRequest('Token no proporcionado');
    }

    if (!password) {
      return ctx.badRequest('Contraseña no proporcionada');
    }

    if (password !== passwordConfirmation) {
      return ctx.badRequest('Las contraseñas no coinciden');
    }

    try {
      // Buscar usuario con token válido
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { resetPasswordToken: token },
      });

      if (!user) {
        return ctx.badRequest('Token inválido');
      }

      if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
        return ctx.badRequest('Token expirado');
      }

      // Actualizar contraseña
      await strapi.service('plugin::users-permissions.user').edit(user.id, {
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      return ctx.send({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      return ctx.badRequest(`Error al restablecer contraseña: ${error.message}`);
    }
  },

  async verifyEmail(ctx) {
    const { token } = ctx.request.body;

    if (!token) {
      return ctx.badRequest('Token no proporcionado');
    }

    try {
      // Buscar usuario con token de verificación
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { confirmationToken: token },
      });

      if (!user) {
        return ctx.badRequest('Token de verificación inválido');
      }

      // Actualizar usuario como verificado
      await strapi.service('plugin::users-permissions.user').edit(user.id, {
        confirmed: true,
        confirmationToken: null,
      });

      return ctx.send({ message: 'Email verificado correctamente' });
    } catch (error) {
      console.error('Error al verificar email:', error);
      return ctx.badRequest(`Error al verificar email: ${error.message}`);
    }
  },

  async updateProfile(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('No autorizado');
    }
    
    const { nombre, apellido, telefono } = ctx.request.body;

    try {
      // Crear objeto con los campos a actualizar
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellido !== undefined) updateData.apellido = apellido;
      if (telefono !== undefined) updateData.telefono = telefono;

      // Actualizar perfil
      const updatedUser = await strapi.service('plugin::users-permissions.user').edit(user.id, updateData);

      // Devolver usuario sanitizado
      const sanitizedUser = await this.sanitizeUser(updatedUser);
      return ctx.send(sanitizedUser);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      return ctx.badRequest(`Error al actualizar el perfil: ${error.message}`);
    }
  },

  // Método auxiliar para sanitizar el usuario
  async sanitizeUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      provider: user.provider,
      confirmed: user.confirmed,
      blocked: user.blocked,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        type: user.role.type,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
}; 