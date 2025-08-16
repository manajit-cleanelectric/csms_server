import {UserRoles, Users} from "../models/users";
import jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY, logger, OTP_LENGTH, redisClient, REFRESH_TOKEN_SECRET_KEY} from "../app";
import {sendOtp} from "../services/sms.services"
import {AuthTokens} from "../models/authTokens";
import {
    InvalidAuthError,
    MissingParameterError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError
} from "../errors/customErrors";

async function addUserInfo(userId: string, data: any) {
    // Validate input data
    if (!data.firstName || !data.lastName) {
        throw new MissingParameterError("Missing required user information");
    }
    const {firstName, lastName, city, state} = data;
    // Check if a user already exists
    const user = await Users.findOneBy({id: userId});
    if (!user) {
        throw new ResourceNotFoundError(`User not found with id ${userId}`);
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.city = city;
    user.state = state;
    user.isProfileComplete = true;
    await user.save();
    return user;
}

async function updateUser(userId: string, data: any) {
    const user = await Users.findOneBy({id: userId});
    if (!user) {
        throw new ResourceNotFoundError(`User not found with id ${userId}`);
    }
    // Update user information
    user.firstName = data.firstName ?? user.firstName;
    user.lastName = data.lastName ?? user.lastName;
    user.city = data.city ?? user.city;
    user.state = data.state ?? user.state;
    user.isProfileComplete = !(!user.firstName || !user.lastName);
    await user.save();
    return user;
}

async function login(phoneNumber: string, otp: string) {
    const storedOTP = await getOTP(phoneNumber);
    if (!storedOTP || String(storedOTP) !== String(otp)) {
        throw new InvalidAuthError(`Invalid OTP provided`);
    }
    let user: Users | null = await Users.findOneBy({phoneNumber: phoneNumber});
    if (!user) {
        // create a new user
        user = new Users();
        user.phoneNumber = phoneNumber;
        await user.save();
    } else {
        // TODO to allow concurrent login change the login here
        await AuthTokens.update({user: user}, {isRevoked: true});
    }
    // Trim a user object to remove sensitive information
    const trimmedUser = {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
    // return jwt token
    const accessToken = jwt.sign({trimmedUser}, JWT_SECRET_KEY, {expiresIn: '3h'});
    const refreshToken = jwt.sign({trimmedUser}, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
    const authToken = new AuthTokens()
    authToken.user = user;
    authToken.token = refreshToken;
    // TODO add other details
    await authToken.save()
    return {accessToken, refreshToken, user};
}

async function getUserById(userId: string) {
    try {
        const user = await Users.findOneBy({id: userId});
        if (!user) {
            throw new Error("User not found with id " + userId);
        }
        return user;
    } catch (error) {
        logger.error(error);
        throw new Error("Could not find user with id " + userId);
    }
}

async function getUserByIdWithVehicles(userId: string) {
    try {
        const user = await Users.findOne({
            where: {id: userId},
            relations: ['vehicles'],
        });
        if (!user) {
            throw new Error("User not found with id " + userId);
        }
        return user;
    } catch (error) {
        logger.error(error);
        throw new Error("Could not find user with id " + userId);
    }
}

async function generateAccessTokenViaRefreshToken(token: string) {
    if (token != "" && !token) {
        throw new InvalidAuthError(`Token not provided.`);
    }
    const authToken = await AuthTokens.findOne({
        where: {token: token, isRevoked: false},
        relations: ['user'],
    });
    if (!authToken) {
        throw new InvalidAuthError(`Invalid refresh token provided`);
    }
    const user = authToken.user;
    if (!user) {
        throw new ResourceNotFoundError(`User not found for the provided token`);
    }
    return jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '3h'});
}

async function logout(token: string) {
    const authToken = await AuthTokens.findOneBy({token: token, isRevoked: false});
    if (!authToken) {
        throw new InvalidAuthError(`Invalid refresh token provided`);
    }
    authToken.isRevoked = true;
    await authToken.save();
    return true;
}

async function sendOtpToPhoneNumber(phoneNumber: string) {
    let otp = await getOTP(phoneNumber);
    if (!otp) {
        otp = generateRandomDigitString(OTP_LENGTH);
        // TODO remove if block once DLT message is implemented as it prevents from sending the message
        if (/^[0-5]/.test(phoneNumber)) {
            otp = "1234";
        }
        await storeOTP(phoneNumber, otp);
    }
    try {
        await sendOtp(phoneNumber, otp);
        return true;
    } catch (error) {
        logger.error("Error occurred while sending otp:", error);
        throw new Error("Something went wrong in sending OTP");
    }
}

function generateRandomDigitString(size: number): string {
    if (size <= 0) throw new Error('k must be a positive integer');
    if (size === 1) return Math.floor(Math.random() * 10).toString();
    const min = Math.pow(10, size - 1);
    const max = Math.pow(10, size) - 1;
    const num = Math.floor(min + Math.random() * (max - min + 1));
    return num.toString();
    // TODO remove next line and uncomment previous line
    // return "1234"
}

// Store OTP
async function storeOTP(phoneNumber: string, otp: string) {
    const key = `otp:${phoneNumber}`;
    await redisClient.set(key, otp, 'EX', 300); // EX 300 = 5 minutes
}

// Retrieve OTP
async function getOTP(phoneNumber: string) {
    const key = `otp:${phoneNumber}`;
    return redisClient.get(key);
}

async function isPhoneNoAvailable(phoneNumber: string) {
    const user = await Users.findOneBy({phoneNumber: phoneNumber});
    if (user) {
        throw new ResourceAlreadyExistsError(`Phone number ${phoneNumber} is already registered`);
    }
    return true;
}

async function updateUserPhoneNo(userId: string, newPhoneNumber: string, otp: string) {
    if (!userId || !newPhoneNumber) {
        throw new MissingParameterError("User ID is required");
    }
    if (otp != "1234") {
        // TODO proper validation of OTP
        throw new InvalidAuthError(`Invalid OTP provided`);
    }
    // Check if the new phone number is already registered
    const existingUser = await Users.findOneBy({phoneNumber: newPhoneNumber});
    if (existingUser) {
        throw new ResourceAlreadyExistsError(`Phone number ${newPhoneNumber} is already registered`);
    }
    const user = await Users.findOneBy({id: userId});
    if (!user) {
        throw new ResourceNotFoundError(`User not found with id ${userId}`);
    }
    user.phoneNumber = newPhoneNumber;
    await user.save();
    return user;
}

async function listUnApprovedUsers() {
    const users = await Users.find({
        select: ["id", "firstName", "lastName", "phoneNumber"],
        relations: ["vehicles"],
        where: {isAccountApproved: false, isProfileComplete: true}
    });
    if (users.length === 0) {
        throw new ResourceNotFoundError("No unapproved users found");
    }
    return users;
}

async function approveUser(userId: string) {
    const user = await Users.findOneBy({id: userId});
    if (!user) {
        throw new ResourceNotFoundError(`User not found with id ${userId}`);
    }
    user.isAccountApproved = true;
    await user.save();
    return user;
}

async function listCustomers() {
    try {
        return await Users.find({
            where: {role: UserRoles.CUSTOMER}
        });
    } catch (error) {
        logger.error(`Error occurred while listing customers: ${error}`);
    }
}

export {
    addUserInfo,
    updateUser,
    login,
    listUnApprovedUsers,
    approveUser,
    sendOtpToPhoneNumber,
    getUserById,
    getUserByIdWithVehicles,
    generateAccessTokenViaRefreshToken,
    logout,
    isPhoneNoAvailable,
    updateUserPhoneNo,
    listCustomers,
}