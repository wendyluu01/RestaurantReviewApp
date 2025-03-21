'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
const b64id = require('b64id');

const filePath = path.join(__dirname, '../samples/yelp_academic_dataset_review_2.json');
const chunkSize = 1; // Process 5000 records at a time

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    let transaction;
    try {
   
      // Get all the business list and map it to the business id
      const businessList = await queryInterface.sequelize.query('SELECT id, uuid FROM business', { type: queryInterface.sequelize.QueryTypes.SELECT });
      const businessMap: any = {};
      await Promise.all(businessList.map(async (business: any) => {
        businessMap[b64id.uuidToB64(business.uuid)] = business.id;
      }));

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

      console.log("Processing reviews...");
      let reviewChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let review;
        try {
          review = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid review:", line);
          continue;
        }

        const businessId = businessMap[review.business_id];
        const userId = userMap[review.user_id];

        // console.log(`businessId is ${businessId}...`);
        if (businessId !== undefined && userId !== undefined) {
          reviewChunk.push({
            uuid: b64id.b64ToUuid(review.review_id),
            user_id: userId,
            business_id: businessId,
            stars: review.stars,
            useful: review.useful,
            funny: review.funny,
            cool: review.cool,
            text: review.text,
            createdAt: new Date(review.date),
            updatedAt: new Date(review.date)
          });
        }

        // Insert reviews in chunks
        if (reviewChunk.length >= chunkSize) {
          console.log(`Inserting batch ${++count}...`);
          transaction = await queryInterface.sequelize.transaction();
          try {
            // await queryInterface.bulkInsert('reviews', reviewChunk, { transaction });
            await transaction.rollback();
            // await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          reviewChunk = [];
        }
      }

      // Insert remaining reviews
      if (reviewChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('reviews', reviewChunk, { transaction });
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
      await queryInterface.bulkDelete('reviews', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
