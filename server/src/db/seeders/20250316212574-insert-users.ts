'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
const b64id = require('b64id');

const filePath = path.join(__dirname, '../samples/yelp_academic_dataset_user_2.json');
const chunkSize = 1; // Process 5000 records at a time

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    let transaction;
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return Promise.resolve();
      }

      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      console.log("Processing users...");
      let usersChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let user;
        try {
          user = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid user:", line);
          continue;
        }

        usersChunk.push({
          uuid: b64id.b64ToUuid(user.user_id),
          first_name: user.name,
          last_name: '',
          email: '',
          phone: '',
          password: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Insert users in chunks
        if (usersChunk.length >= chunkSize) {
          console.log(`Inserting batch ${++count}...`);
          transaction = await queryInterface.sequelize.transaction();
          try {
            // await queryInterface.bulkInsert('users_user', usersChunk, { transaction });
            await transaction.rollback();
            // await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          usersChunk = [];
        }
      }

      // Insert remaining users
      if (usersChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('users_user', usersChunk, { transaction });
          await transaction.rollback();
          // await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }

      return Promise.resolve();
    } catch (e) {
      if (transaction) await transaction.rollback();
      return Promise.reject(e);
    }
  },
  down: async (queryInterface: any, Sequelize: any) => {
    try {
      await queryInterface.bulkDelete('users_user', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
