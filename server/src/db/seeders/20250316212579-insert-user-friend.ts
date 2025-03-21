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
   
      const userList = await queryInterface.sequelize.query('SELECT id, uuid FROM users_user', { type: queryInterface.sequelize.QueryTypes.SELECT });
      const userMap: any = {};
      await Promise.all(userList.map(async (user: any) => {
        userMap[b64id.uuidToB64(user.uuid)] = user.id;
      }));

      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      console.log("Processing user friend...");
      let userFriendChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let friend;
        try {
          friend = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid user:", line);
          continue;
        }

        const userId = userMap[friend.user_id];

        if (userId !== undefined) {
          // Convert elite field to array

          const friendsArray = friend.friends ? friend.friends.split(',').map((friend: string) => friend.trim()) : [];

          for (let friend of friendsArray) {
            const friendId = userMap[friend];
            if (friendId !== undefined && friendId !== null) {
              userFriendChunk.push({
                user_id: userId,
                friend_id: friendId
              });
            }

            // Insert users friends in chunks
            if (userFriendChunk.length >= chunkSize) {
              console.log(`Inserting batch ${++count}...`);
              transaction = await queryInterface.sequelize.transaction();
              try {
                // await queryInterface.bulkInsert('users_friend', userFriendChunk, { transaction });
                await transaction.rollback();
                // await transaction.commit();
              } catch (error) {
                console.log(error);
                await transaction.rollback();
                throw error;
              }
              userFriendChunk = [];
            }
          }
        }
      }

      // Insert remaining users friends
      if (userFriendChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('users_friend', userFriendChunk, { transaction });
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
      await queryInterface.bulkDelete('users_friend', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
