module.exports = (sequelize, DataTypes) => {
    const users_metadata = sequelize.define('users_metadata', {
        user_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true
    });
    users_metadata.associate = (models) => {
        // associations can be defined here
    };
    return users_metadata;
};
