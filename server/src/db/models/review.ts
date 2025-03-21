module.exports = (sequelize: any, DataTypes: any) => {
  const review = sequelize.define(
    'reviews',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      // user_id: DataTypes.INTEGER,
      // business_id: DataTypes.INTEGER,
      // stars: DataTypes.FLOAT,
      // text: DataTypes.TEXT,
      // createdAt: DataTypes.DATE,
      // updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  review.associate = (models: any) => {
    // associations can be defined here
  };

  return review;
};
