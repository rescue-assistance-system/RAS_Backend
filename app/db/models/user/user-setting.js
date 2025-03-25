import { DataTypes, Model } from "sequelize";

export default class UserSetting extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
        hide_user_profile: { type: DataTypes.BOOLEAN, defaultValue: true },
        extra_setting: { type: DataTypes.JSON, allowNull: true }
      },
      {
        tableName: "user_setting",
        timestamps: false,
        sequelize,
        indexes: [{ fields: ["user_id"], unique: true }],
        ...opts
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { as: "user", foreignKey: "user_id" });
  }
}
