module.exports = (sequelize, DataTypes) => {
    const photo = sequelize.define('photos', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
    }, {
        freezeTableName: true
    });
    photo.associate = (models) => {
        // associations can be defined here
    };
    return photo;
};
