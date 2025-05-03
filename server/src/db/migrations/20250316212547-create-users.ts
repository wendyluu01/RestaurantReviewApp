'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import short from 'short-uuid';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    try {
      const nowDate = new Date();
      const translator = short(short.constants.flickrBase58, {
        consistentLength: false,
      });
      await queryInterface.createTable('users_user', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          unique: true
        },
        first_name: {
          type: Sequelize.STRING
        },
        last_name: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        phone: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        refresh_token: {
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
      
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('users_user');
  }
};
