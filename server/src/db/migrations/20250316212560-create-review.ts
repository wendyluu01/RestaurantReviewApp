'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import short from 'short-uuid';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    try {
      const nowDate = new Date();

      await queryInterface.createTable('reviews', {
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
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users_user',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        business_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'business',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        stars: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        useful: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        funny: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        cool: {
          type: Sequelize.INTEGER,
          allowNull: false
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
    await queryInterface.dropTable('reviews');
  }
};
