'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import short from 'short-uuid';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    try {
      const nowDate = new Date();

      await queryInterface.createTable('business', {
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
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        state: {
          type: Sequelize.STRING(3),
          allowNull: false
        },
        postal_code: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        latitude: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        longitude: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        stars: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        review_count: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        is_open: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        attributes: {
          type: Sequelize.JSON,
          allowNull: true
        },
        categories: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true
        },
        hours: {
          type: Sequelize.JSON,
          allowNull: true
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
    await queryInterface.dropTable('business');
  }
};
