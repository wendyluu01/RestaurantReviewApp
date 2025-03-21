module.exports = (sequelize, DataTypes) => {
    const review = sequelize.define('reviews', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
    }, {
        freezeTableName: true
    });
    review.associate = (models) => {
        // associations can be defined here
    };
    return review;
};
