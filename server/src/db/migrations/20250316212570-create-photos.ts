'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import short from 'short-uuid';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    try {
      const nowDate = new Date();

      await queryInterface.createTable('photos', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        uuid: {
          type: Sequelize.STRING,
        },
        review_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'reviews',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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
        caption: {
          type: Sequelize.STRING,
          allowNull: true
        },
        label: {
          type: Sequelize.STRING,
          allowNull: true
        },
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('photos');
  }
};
