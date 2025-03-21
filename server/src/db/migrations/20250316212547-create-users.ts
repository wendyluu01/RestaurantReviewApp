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
      const passgenerator = function generatePassword(
        length = 8,
        charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      ) {
        return new Array(length)
          .fill(null)
          .map(() => charset.charAt(Math.floor(Math.random() * charset.length)))
          .join('');
      };

      interface UserData {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        uuid: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        refresh_token?: string;
      }
      
      const userData: UserData[] = [
        {
          id: 1,
          email: `admin@test.com`,
          first_name: 'Admin',
          last_name: '',
          phone: '',
          uuid: translator.toUUID(translator.new()),
          password: passgenerator(20),
          createdAt: nowDate,
          updatedAt: nowDate,
        },
        {
          id: 2,
          email: `systemadmin@test.com`,
          first_name: 'System Admin',
          last_name: '',
          phone: '',
          uuid: translator.toUUID(translator.new()),
          password: passgenerator(20),
          createdAt: nowDate,
          updatedAt: nowDate,
        },
        {
          id: 3,
          email: `manager@test.com`,
          first_name: 'Manager',
          last_name: '',
          phone: '',
          uuid: translator.toUUID(translator.new()),
          password: passgenerator(20),
          createdAt: nowDate,
          updatedAt: nowDate,
        },

      ];

      // Do not delete!!!!
      console.log(userData);

      const config = require(__dirname + '/../config/secret');

      userData.forEach(function (data) {
        data.password = bcrypt.hashSync(data.password, 1);

        data['refresh_token'] = jwt.sign({ type: 'refresh' }, config.default.authSecret, {
          expiresIn: '7500h'
        });
      });

      await queryInterface.bulkInsert('users_user', userData);
      await queryInterface.sequelize.query(`ALTER SEQUENCE users_user_id_seq RESTART WITH 4`);

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('users_user');
  }
};
