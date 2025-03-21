'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const nowDate = new Date();
            yield queryInterface.createTable('business', {
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
                name: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                city: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                state: {
                    type: Sequelize.STRING(3),
                    allowNull: false
                },
                postal_code: {
                    type: Sequelize.STRING(20),
                    allowNull: false
                },
                latitude: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                longitude: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                stars: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                review_count: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                is_open: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                attributes: {
                    type: Sequelize.JSON,
                    allowNull: true
                },
                categories: {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true
                },
                hours: {
                    type: Sequelize.JSON,
                    allowNull: true
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
            return Promise.resolve();
        }
        catch (e) {
            return Promise.reject(e);
        }
    }),
    down: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable('business');
    })
};
