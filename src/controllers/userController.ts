import {Users} from "../models/users";
import jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY} from "../app";
import {REFRESH_TOKEN_SECRET_KEY} from "../app";

export async function login(phoneNumber: string, otp: string) {
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