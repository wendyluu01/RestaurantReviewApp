module.exports = (sequelize: any, DataTypes: any) => {
  const api = sequelize.define(
    'api_keys',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    {
      freezeTableName: true
    }
  );

  api.associate = (models: any) => {
    // associations can be defined here
  };

  return api;
};
