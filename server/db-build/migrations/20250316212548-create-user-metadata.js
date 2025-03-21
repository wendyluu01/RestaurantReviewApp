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
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield queryInterface.createTable('users_metadata', {
                user_id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'users_user',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                review_count: {
                    type: Sequelize.INTEGER
                },
                yelping_since: {
                    type: Sequelize.DATEONLY
                },
                useful: {
                    type: Sequelize.INTEGER
                },
                funny: {
                    type: Sequelize.INTEGER
                },
                cool: {
                    type: Sequelize.INTEGER
                },
                fans: {
                    type: Sequelize.INTEGER
                },
                elite: {
                    type: Sequelize.ARRAY(Sequelize.INTEGER)
                },
                average_stars: {
                    type: Sequelize.FLOAT
                },
                compliment_hot: {
                    type: Sequelize.INTEGER
                },
                compliment_more: {
                    type: Sequelize.INTEGER
                },
                compliment_profile: {
                    type: Sequelize.INTEGER
                },
                compliment_cute: {
                    type: Sequelize.INTEGER
                },
                compliment_list: {
                    type: Sequelize.INTEGER
                },
                compliment_note: {
                    type: Sequelize.INTEGER
                },
                compliment_plain: {
                    type: Sequelize.INTEGER
                },
                compliment_cool: {
                    type: Sequelize.INTEGER
                },
                compliment_funny: {
                    type: Sequelize.INTEGER
                },
                compliment_writer: {
                    type: Sequelize.INTEGER
                },
                compliment_photos: {
                    type: Sequelize.INTEGER
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
        yield queryInterface.dropTable('users_metadata');
    })
};
