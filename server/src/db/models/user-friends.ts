module.exports = (sequelize: any, DataTypes: any) => {
  const users_friend = sequelize.define(
    'users_friend',
    {
      user_id: DataTypes.INTEGER,
      // friend_id: DataTypes.INTEGER,
      // createdAt: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  );
  users_friend.associate = (models: any) => {
    // associations can be defined here
  };
  return users_friend;
};
