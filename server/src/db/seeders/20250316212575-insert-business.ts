'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
const b64id = require('b64id');

const filePath = path.join(__dirname, '../samples/yelp_academic_dataset_business_2.json');
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

      console.log("Processing business...");
      let businessChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let business;
        try {
          business = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid business:", line);
          continue;
        }

        businessChunk.push({
          uuid: b64id.b64ToUuid(business.business_id),
          name: business.name,
          address: business.address,
          city: business.city,
          state: business.state,
          postal_code: business.postal_code,
          latitude: business.latitude,
          longitude: business.longitude,
          stars: business.stars,
          review_count: business.review_count,
          is_open: business.is_open,
          attributes: JSON.stringify(business.attributes),
          categories: business.categories ? business.categories.split(', ').map((category: string) => category.trim()) : null,
          hours: JSON.stringify(business.hours),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Insert users in chunks
        if (businessChunk.length >= chunkSize) {
          console.log(`Inserting batch ${++count}...`);
          transaction = await queryInterface.sequelize.transaction();
          try {
            // await queryInterface.bulkInsert('business', businessChunk, { transaction });
            await transaction.rollback();
            // await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          businessChunk = [];
        }
      }

      // Insert remaining users
      if (businessChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('business', businessChunk, { transaction });
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
      await queryInterface.bulkDelete('business', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

