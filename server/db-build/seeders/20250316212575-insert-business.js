'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const b64id = require('b64id');
const filePath = path.join(__dirname, '../samples/yelp_academic_dataset_business_2.json');
const chunkSize = 1; // Process 5000 records at a time
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        var e_1, _a;
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
            let businessChunk = [];
            let count = 0;
            try {
                for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    let business;
                    try {
                        business = JSON.parse(line);
                    }
                    catch (error) {
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
                        categories: business.categories ? business.categories.split(', ').map((category) => category.trim()) : null,
                        hours: JSON.stringify(business.hours),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    // Insert users in chunks
                    if (businessChunk.length >= chunkSize) {
                        console.log(`Inserting batch ${++count}...`);
                        transaction = yield queryInterface.sequelize.transaction();
                        try {
                            // await queryInterface.bulkInsert('business', businessChunk, { transaction });
                            yield transaction.rollback();
                            // await transaction.commit();
                        }
                        catch (error) {
                            yield transaction.rollback();
                            throw error;
                        }
                        businessChunk = [];
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Insert remaining users
            if (businessChunk.length > 0) {
                transaction = yield queryInterface.sequelize.transaction();
                try {
                    // await queryInterface.bulkInsert('business', businessChunk, { transaction });
                    yield transaction.rollback();
                    // await transaction.commit();
                }
                catch (error) {
                    yield transaction.rollback();
                    throw error;
                }
            }
            return Promise.resolve();
        }
        catch (e) {
            if (transaction)
                yield transaction.rollback();
            return Promise.reject(e);
        }
    }),
    down: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield queryInterface.bulkDelete('business', null, {});
            return Promise.resolve();
        }
        catch (e) {
            return Promise.reject(e);
        }
    })
};
