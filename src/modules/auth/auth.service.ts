import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
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
        is_active: user.is_active
    }

    const accessToken = jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" })

    console.log("service: ", accessToken)


    return { accessToken };
}

export const authService = {
    authLoginIntoBD
}