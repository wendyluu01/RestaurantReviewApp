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

      console.log("Processing user metadata...");
      let userMetadataChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let metadata;
        try {
          metadata = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid user:", line);
          continue;
        }

        const userId = userMap[metadata.user_id];

        if (userId !== undefined) {
          // Convert elite field to array
          const eliteArray = metadata.elite ? metadata.elite.split(',').map((year: string) => parseInt(year.trim())) : [];

          userMetadataChunk.push({
            user_id: userId,
            review_count: metadata.review_count,
            yelping_since: metadata.yelping_since,
            useful: metadata.useful,
            funny: metadata.funny,
            cool: metadata.cool,
            fans: metadata.fans,
            elite: Sequelize.cast(eliteArray, 'integer[]'),
            average_stars: metadata.average_stars,
            compliment_hot: metadata.compliment_hot,
            compliment_more: metadata.compliment_more,
            compliment_profile: metadata.compliment_profile,
            compliment_cute: metadata.compliment_cute,
            compliment_list: metadata.compliment_list,
            compliment_note: metadata.compliment_note,
            compliment_plain: metadata.compliment_plain,
            compliment_cool: metadata.compliment_cool,
            compliment_funny: metadata.compliment_funny,
            compliment_writer: metadata.compliment_writer,
            compliment_photos: metadata.compliment_photos,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        // Insert users metadata in chunks
        if (userMetadataChunk.length >= chunkSize) {
          console.log(`Inserting batch ${++count}...`);
          transaction = await queryInterface.sequelize.transaction();
          try {
            // await queryInterface.bulkInsert('users_metadata', userMetadataChunk, { transaction });
            await transaction.rollback();
            // await transaction.commit();
          } catch (error) {
            console.log(error);
            await transaction.rollback();
            throw error;
          }
          userMetadataChunk = [];
        }
      }

      // Insert remaining users metadata
      if (userMetadataChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('users_metadata', userMetadataChunk, { transaction });
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
      await queryInterface.bulkDelete('users_metadata', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
