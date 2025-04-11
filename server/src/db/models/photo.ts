module.exports = (sequelize: any, DataTypes: any) => {
  const photo = sequelize.define(
    'photos',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false
      },
      user_id: DataTypes.INTEGER,
      business_id: DataTypes.INTEGER,
      caption: DataTypes.STRING,
      label: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  photo.associate = (models: any) => {
    photo.belongsTo(models.business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return photo;
};
