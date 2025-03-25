import { DataTypes, Model } from "sequelize";

export default class User extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
        email: { type: DataTypes.STRING(100), allowNull: true, unique: true },
        password: { type: DataTypes.STRING(256), allowNull: false },
        status: { type: DataTypes.SMALLINT, defaultValue: 1},
        email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
        phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
        avatar_url: { type: DataTypes.STRING(512), allowNull: true },
      },
      {
        tableName: "user",
        timestamps: true,
        sequelize,
        indexes: [
          { fields: ["email"], unique: true },
          { fields: ["phone"], unique: true },
        ],
        ...opts,
      }
    );
  }

  static associate(models) {
    this.hasOne(models.UserRole, { as: "role", foreignKey: "user_id" });
    this.hasOne(models.UserProfile, { as: "profile", foreignKey: "user_id" });
    this.hasOne(models.UserSetting, { as: "setting", foreignKey: "user_id" });
  }
}
