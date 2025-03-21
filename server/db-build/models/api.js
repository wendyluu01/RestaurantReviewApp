module.exports = (sequelize, DataTypes) => {
    const api = sequelize.define('api_keys', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        freezeTableName: true
    });
    api.associate = (models) => {
        // associations can be defined here
    };
    return api;
};
