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
            yield queryInterface.createTable('reviews', {
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
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users_user',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                business_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'business',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                stars: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                text: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                useful: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                funny: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                cool: {
                    type: Sequelize.INTEGER,
                    allowNull: false
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
        yield queryInterface.dropTable('reviews');
    })
};
