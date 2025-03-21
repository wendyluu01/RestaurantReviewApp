module.exports = (sequelize, DataTypes) => {
    const users_friend = sequelize.define('users_friend', {
        user_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true
    });
    users_friend.associate = (models) => {
        // associations can be defined here
    };
    return users_friend;
};
