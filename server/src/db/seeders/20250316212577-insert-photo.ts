'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
const b64id = require('b64id');

const filePath = path.join(__dirname, '../samples/photos_2.json');
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

      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      console.log("Processing photos...");
      let photoChunk: any[] = [];
      let count = 0;

      for await (const line of rl) {
        let photo;
        try {
          photo = JSON.parse(line);
        } catch (error) {
          console.warn("Skipping invalid photo:", line);
          continue;
        }

        const businessId = businessMap[photo.business_id];

        if (businessId !== undefined) {
          photoChunk.push({
            uuid: b64id.b64ToUuid(photo.photo_id),
            user_id: null,
            business_id: businessId,
            caption: photo.caption,
            label: photo.label
          });
        }

        // Insert photos in chunks
        if (photoChunk.length >= chunkSize) {
          console.log(`Inserting batch ${++count}...`);
          transaction = await queryInterface.sequelize.transaction();
          try {
            // await queryInterface.bulkInsert('photos', photoChunk, { transaction });
            await transaction.rollback();
            // await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          photoChunk = [];
        }
      }

      // Insert remaining photos
      if (photoChunk.length > 0) {
        transaction = await queryInterface.sequelize.transaction();
        try {
          // await queryInterface.bulkInsert('photos', photoChunk, { transaction });
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
      await queryInterface.bulkDelete('photos', null, {});
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
