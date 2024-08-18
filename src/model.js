export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      startLatitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      startLongitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      endLatitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      endLongitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      distanceMeter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
      indexes: [
        {
          fields: ["status"],
        },
      ],
    }
  );
};
