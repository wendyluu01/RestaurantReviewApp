module.exports = (sequelize: any, DataTypes: any) => {
  const photo = sequelize.define(
    'photos',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      // userId: DataTypes.INTEGER,
      // businessId: DataTypes.INTEGER,
      // url: DataTypes.STRING,
      // caption: DataTypes.STRING,
      // createdAt: DataTypes.DATE,
      // updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  photo.associate = (models: any) => {
    // associations can be defined here
  };

  return photo;
};
