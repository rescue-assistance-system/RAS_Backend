import User from "./user.js";
import UserRole from "./user-role.js";
import UserSetting from "./user-setting.js";
import UserProfile from "./user-profile.js";

export function initUserModel(sequelize) {
  return {
    User: User.init(sequelize),
    UserProfile: UserProfile.init(sequelize),
    UserRole: UserRole.init(sequelize),
    UserSetting: UserSetting.init(sequelize),
  };
}
