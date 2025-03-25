import initUserController from "./user.controller.js";
import initUserFamilyController from "./user-family.controller.js";
import initUserProfileController from "./user-profile.controller.js";
import initUserRoleController from "./user-role.controller.js";

const initApiController = (app) => {

    initUserController(app);
    initUserFamilyController(app);
    initUserProfileController(app);
    initUserRoleController(app);
}

export default initApiController;