const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LiveBusLocation = sequelize.define(
  "LiveBusLocation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bus_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Only one active location per bus
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    speed: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Speed in km/h'
    },
    heading: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Direction in degrees (0-360)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    trip_status: {
      type: DataTypes.ENUM('active', 'ended', 'paused'),
      defaultValue: 'active',
    },
  },
  {
    tableName: "live_bus_locations",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['bus_id'] },
      { fields: ['driver_id'] },
      { fields: ['is_active'] },
      { fields: ['updated_at'] }
    ]
  }
);

module.exports = LiveBusLocation;
