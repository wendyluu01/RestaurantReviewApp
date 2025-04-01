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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcrypt"));
const short_uuid_1 = __importDefault(require("short-uuid"));
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nowDate = new Date();
            const translator = short_uuid_1.default(short_uuid_1.default.constants.flickrBase58, {
                consistentLength: false,
            });
            yield queryInterface.createTable('users_user', {
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
            const passgenerator = function generatePassword(length = 8, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
                return new Array(length)
                    .fill(null)
                    .map(() => charset.charAt(Math.floor(Math.random() * charset.length)))
                    .join('');
            };
            const userData = [
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
            yield queryInterface.bulkInsert('users_user', userData);
            yield queryInterface.sequelize.query(`ALTER SEQUENCE users_user_id_seq RESTART WITH 4`);
            return Promise.resolve();
        }
        catch (e) {
            return Promise.reject(e);
        }
    }),
    down: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable('users_user');
    })
};
