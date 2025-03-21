module.exports = (sequelize, DataTypes) => {
    const business = sequelize.define('business', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
        // uuid: {
        //   type: DataTypes.UUID,
        //   allowNull: false
        // },
        // name: DataTypes.STRING,
        // address: DataTypes.STRING,
        // city: DataTypes.STRING,
        // state: DataTypes.STRING(2),
        // postal_code: DataTypes.STRING,
        // latitude: DataTypes.FLOAT,
        // longitude: DataTypes.FLOAT,
        // stars: DataTypes.FLOAT,
        // review_count: DataTypes.INTEGER,
        // is_open: DataTypes.INTEGER,
        // attributes: DataTypes.JSON,
        // categories: DataTypes.ARRAY(DataTypes.STRING),
        // hours: DataTypes.JSON,
        // createdAt: DataTypes.DATE,
        // updatedAt: DataTypes.DATE
    }, {
        freezeTableName: true
    });
    business.associate = (models) => {
        // associations can be defined here
    };
    return business;
};
