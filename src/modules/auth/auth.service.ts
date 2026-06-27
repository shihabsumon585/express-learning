import { pool } from "../../db";
import bcrypt from "bcrypt";
import Jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../../config";

const authLoginIntoBD = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;

    // 1. check user if is it in database
    // 2. compare password
    // 3. generate web token

    // check user
    const result = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);

    const user = result.rows[0];

    if (result.rows.length === 0) {
        throw new Error("User not found... please Register...");
    }

    const matchPassword = await bcrypt.compare(password, result.rows[0].password);

    if (!matchPassword) {
        throw new Error("Invalid Creadential!")
    }

    // Generate Token

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        is_active: user.is_active,
        role: user.role
    }

    const accessToken = Jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" })

    const refreshToken = Jwt.sign(jwtPayload, config.refresh_secret as string, { expiresIn: "1d" })

    // console.log("service: ", accessToken)


    return { accessToken, refreshToken };
}

const generateAccessToken = async (token: string) => {

    if (!token) {
        throw new Error("Unauthorized Access...")
    }

    const decoded = await Jwt.verify(token as string, config.refresh_secret as string) as JwtPayload;

    const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
        `, [decoded.email]);

    const user = userData.rows[0];

    if (!user) {
        throw new Error("User Not Found...")
    }

    if (!user.is_active) {
        throw new Error("User not Activated...")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        is_active: user.is_active,
        role: user.role
    }

    const accessToken = await Jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" })

    return { accessToken };

}

export const authService = {
    authLoginIntoBD,
    generateAccessToken
}