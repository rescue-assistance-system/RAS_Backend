import { DataTypes, Model } from "sequelize";

export default class UserRole extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          unique: true, // Ensures one user has only one role
        },
        duty: { type: DataTypes.SMALLINT, allowNull: false },
        permissions: { type: DataTypes.JSON, allowNull: true },
      },
      {
        tableName: "user_role",
        timestamps: false,
        sequelize,
        indexes: [{ fields: ["user_id"], unique: true }],
        ...opts,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { as: "user", foreignKey: "user_id" });
  }
}
