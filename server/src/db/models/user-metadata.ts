module.exports = (sequelize: any, DataTypes: any) => {
  const users_metadata = sequelize.define(
    'users_metadata',
    {
      user_id: DataTypes.INTEGER,
      // createdAt: DataTypes.DATE,
      // updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );

  users_metadata.associate = (models: any) => {
    // associations can be defined here
  };
  return users_metadata;
};
