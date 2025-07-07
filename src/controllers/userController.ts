import {Users} from "../models/users";
import jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY, logger, REFRESH_TOKEN_SECRET_KEY} from "../app";

// async function addUser(firstName: string, lastName: string, phoneNumber: string, vehicle: string) {
//     try {
//         // Check if user already exists
//         const existingUser = await Users.findOne({
//             where: [
//                 {phoneNumber: phoneNumber},
//                 {vehicle: vehicle},
//             ]
//         });
//         if (existingUser) {
//             return null;
//         }
//         // Create a new user
//         const user = new Users();
//         user.firstName = firstName;
//         user.lastName = lastName;
//         user.phoneNumber = phoneNumber;
//         user.vehicle = vehicle;
//         await user.save();
//         return user;
//     } catch (error) {
//         logger.error("Error adding user:", error);
//         throw new Error("Failed to add user");
//     }
// }

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
        throw new Error("Invalid One Time Password");
    }
    const user: Users | null = await Users.findOneBy({phoneNumber: phoneNumber});
    if (!user) {
        // create a new user and return jwt token
        const user = new Users();
        user.phoneNumber = phoneNumber;
        await user.save();
        const accessToken = jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '3h'});
        const refreshToken = jwt.sign({user}, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
        return {accessToken, refreshToken};
    } else {
        // return jwt token
        const accessToken = jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '3h'});
        const refreshToken = jwt.sign({user}, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
        return {accessToken, refreshToken};
    }
}

async function listUnApprovedUsers() {
    try {
        return await Users.find({
            select: ["id", "firstName", "lastName", "phoneNumber", "vehicles"],
            where: {isAccountApproved: false, isProfileComplete: true}
        });
    } catch (error) {
        logger.error("Error fetching unapproved users:", error);
        throw new Error("Failed to fetch unapproved users");
    }
}

async function approveUser(userId: number) {
    try {
        const user = await Users.findOneBy({id: userId});
        if (!user) {
            throw new Error("User not found");
        }
        user.isAccountApproved = true;
        await user.save();
        return user;
    } catch (error) {
        logger.error("Error approving user:", error);
        throw new Error("Failed to approve user");
    }
}

export {
    // addUser,
    // updateUserRC,
    // updateUser,
    login,
    listUnApprovedUsers,
    approveUser,
}