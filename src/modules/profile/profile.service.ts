import { pool } from "../../db";



const createProfileIntoDB = async (payload: { user_id: number, email: string, bio: string, address: string, gender: string, phone: string }) => {
    const { user_id, email, bio, address, gender, phone } = payload;
    const userFromDB = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [user_id])

    const user = userFromDB.rows[0];

    if (user.email !== email) {
        throw new Error("User Creadential Invalid...")
    }

    const result = await pool.query(`
            INSERT INTO profiles(user_id, name, bio, address, phone, gender) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
            `, [user_id, user.name, bio, address, phone, gender])

    return result;
    ;
}

export const profileService = {
    createProfileIntoDB,
}