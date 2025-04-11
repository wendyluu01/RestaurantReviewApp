module.exports = (sequelize: any, DataTypes: any) => {
  const review = sequelize.define(
    'reviews',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      user_id: DataTypes.INTEGER,
      business_id: DataTypes.INTEGER,
      stars: DataTypes.FLOAT,
      text: DataTypes.TEXT,
      useful: DataTypes.INTEGER,
      funny: DataTypes.INTEGER,
      cool:DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  review.associate = (models: any) => {
    review.belongsTo(models.business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return review;
};
