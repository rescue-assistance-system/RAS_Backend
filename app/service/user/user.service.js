import db from '../../db/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginUser = async ({ email, password }, res) => {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }

    email = email.toLowerCase();

    const foundUser = await db.User.findOne({ email }).exec();
    if (!foundUser) {
        throw new Error('Unauthorized: User not found.');
    }

    // Evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        throw new Error('Incorrect password, please try again.');
    }

    return generateRefreshToken(res, foundUser);
}

export const generateRefreshToken = async (res, userObject = null) => {
    const roles = Object.values(userObject.roles).filter(Boolean);
    const refreshToken = jwt.sign(
        { 
            email: userObject.email,
            roles: roles,
            permissions: userObject.permissions
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
    
    // Saving refreshToken with current user
    userObject.refreshToken = refreshToken;
    await userObject.save();
    
    res.cookie('refreshToken', refreshToken, {
        // domain: '.liveboat.com',
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000
    });
    
    // For mobile app
    return { 
        refreshToken 
    };
}

export const logoutUser = async (req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies?.refreshToken || req.body?.refreshToken; // Get from cookie (Web) or request body (Mobile)

    if (!refreshToken) return null; // No content

    // Check if refreshToken exists in DB
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie("refreshToken", { httpOnly: true, sameSite: "None", secure: true });
        return null;
    }

    // Remove refreshToken from DB
    foundUser.refreshToken = "";
    await foundUser.save();

    // Clear cookie for Web clients
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "None", secure: true });

    return null; // Logout successful
};

export const registerUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }

    email = email.toLowerCase();

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction
    const transaction = await db.sequelize.transaction();
    try {
        // Create the user
        const newUser = await db.User.create({ email, password: hashedPassword }, { transaction });

        // Create related records
        await db.UserProfile.create({
            user_id: newUser.id,
            first_name: 'First',
            last_name: 'Last'
        }, { transaction });

        await db.UserRole.create({
            user_id: newUser.id,
            duty: 1,
            permissions: {}
        }, { transaction });

        await db.UserSetting.create({
            user_id: newUser.id,
            hide_user_profile: true,
            extra_setting: {}
        }, { transaction });

        // Commit transaction
        await transaction.commit();

        return newUser;
    } catch (error) {
        // Rollback in case of failure
        await transaction.rollback();
        throw new Error(`Registration failed: ${error.message}`);
    }
};
