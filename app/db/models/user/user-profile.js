import { DataTypes, Model } from "sequelize";

export default class UserProfile extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
        first_name: { type: DataTypes.STRING(255), allowNull: false },
        last_name: { type: DataTypes.STRING(255), allowNull: false },
        address: { type: DataTypes.STRING(255), allowNull: true },
        gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: true },
        birthday: { type: DataTypes.DATEONLY, allowNull: true },
        blood_type: { type: DataTypes.ENUM("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"), allowNull: true },
        height: { type: DataTypes.SMALLINT, allowNull: true },
        weight: { type: DataTypes.SMALLINT, allowNull: true },
        other_condition: { type: DataTypes.JSON, allowNull: true }
      },
      {
        tableName: "user_profile",
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
