const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bus = sequelize.define(
  "Bus",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Foreign key to Driver - each bus is assigned to a single driver"
    },

    plate_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    model: {
      type: DataTypes.STRING,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "buses",
    timestamps: true,
    underscored: true,
  }
);


  

module.exports = Bus;
