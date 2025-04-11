module.exports = (sequelize: any, DataTypes: any) => {
  const business = sequelize.define(
    'business',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      postal_code: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      stars: DataTypes.FLOAT,
      review_count: DataTypes.INTEGER,
      is_open: DataTypes.INTEGER,
      attributes: DataTypes.JSON,
      categories: DataTypes.ARRAY(DataTypes.STRING),
      hours: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  business.associate = (models: any) => {
    business.hasMany(models.reviews, {
      foreignKey: 'business_id',
      as: 'reviews'
    });
    business.hasMany(models.photos, {
      foreignKey: 'business_id',
      as: 'photos'
    });
  };

  return business;
};
