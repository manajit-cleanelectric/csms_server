import {Users} from "../models/users";
import jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY, logger, REFRESH_TOKEN_SECRET_KEY} from "../app";
import {sendOtp} from "../services/smsService"
import {AuthTokens} from "../models/authTokens";
import {InvalidAuthError, MissingParameterError, ResourceNotFoundError} from "../errors/customErrors";

async function addUserInfo(data: any) {
    // Validate input data
    if (!data.firstName || !data.lastName || !data.phoneNumber) {
        throw new MissingParameterError("Missing required user information");
    }
    const {firstName, lastName, phoneNumber, city, state} = data;
    // Check if a user already exists
    const user = await Users.findOneBy({phoneNumber: phoneNumber});
    if (!user) {
        throw new ResourceNotFoundError(`User with phone number ${phoneNumber} not found`);
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.city = city;
    user.state = state;
    user.isProfileComplete = true;
    await user.save();
    return user;
}

// async function updateUserRC(userId: number, rcNumber: string, rcImageURL: string){
//     try {
//         const user = await Users.findOneBy({id: userId});
//         if (!user) {
//             throw new Error("User not found");
//         }
//         user.rcNumber = rcNumber;
//         user.rcImageURL = rcImageURL;
//         user.isProfileComplete = true; // Assuming RC update means profile is complete
//         await user.save();
//         return user;
//     } catch (error) {
//         logger.error("Error updating user RC:", error);
//         throw new Error("Failed to update user RC");
//     }
// }

// async function updateUser(userId: number, firstName: string, lastName: string, vehicle: string, phoneNumber: string) {
//     try {
//         const user = await Users.findOneBy({id: userId});
//         if (!user) {
//             throw new Error("User not found");
//         }
//         user.firstName = firstName || user.firstName;
//         user.lastName = lastName || user.lastName;
//         user.phoneNumber = phoneNumber || user.phoneNumber;
//         if (vehicle) {
//             // Check if the vehicle already exists for another user
//             const existingUser = await Users.findOneBy({ vehicle: vehicle, id: Not(userId) });
//             if (existingUser) {
//                 throw new Error("Vehicle already registered to another user");
//             }
//             user.vehicle = vehicle;
//             user.isProfileComplete = false; // Reset profile completion if vehicle is updated
//             user.isAccountApproved = false;
//             user.rcNumber = ""; // Reset RC number if vehicle is updated
//             user.rcImageURL = ""; // Reset RC image URL if vehicle is updated
//
//         }
//     } catch (error) {
//         logger.error("Error updating user:", error);
//         throw new Error("Failed to update user");
//     }
// }

async function login(phoneNumber: string, otp: string) {
    // otp validation needs to be done
    if (otp != "1234") {
        // TODO proper validation of OTP
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
    // return jwt token
    const accessToken = jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '3h'});
    const refreshToken = jwt.sign({user}, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
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

async function generateAccessTokenViaRefreshToken(token: string) {
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
    const otp = generateRandomDigitString(4);
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

export {
    addUserInfo,
    // updateUserRC,
    // updateUser,
    login,
    listUnApprovedUsers,
    approveUser,
    sendOtpToPhoneNumber,
    getUserById,
    generateAccessTokenViaRefreshToken,
    logout,
}