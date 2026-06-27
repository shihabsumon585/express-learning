
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.SECRET_KEY,
  refresh_secret: process.env.REFRESH_SECRET_KEY
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,
      role VARCHAR(10) DEFAULT 'user',

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS profiles(
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        name TEXT,
        bio TEXT,
        address TEXT,
        phone VARCHAR(15),
        gender VARCHAR(10),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log("From init DB: ", error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
var createUserIntoDB = async (payload) => {
  const { name, email, password, age, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
      INSERT INTO users(name, email, password, age, role) VALUES($1, $2, $3, $4, COALESCE($5, 'user')) RETURNING *
    `, [name, email, hashPassword, age, role]);
  delete result.rows[0].password;
  return result;
};
var getAllUserFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM users
      `);
  return result;
};
var getSingleUserFromBD = async (id) => {
  const result = await pool.query(`
        SELECT * FROM users WHERE id=$1
      `, [id]);
  return result;
};
var updateUserFromDB = async (payload, id) => {
  const { name, password, age, is_active } = payload;
  const result = await pool.query(`
      UPDATE users 
      SET 
      name=COALESCE($1, name),
      password=COALESCE($2, password),
      age=COALESCE($3, age),
      is_active=COALESCE($4, is_active)
      WHERE id=$5 RETURNING *
    `, [name, password, age, is_active, id]);
  return result;
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM users WHERE id=$1
      `, [id]);
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromBD,
  updateUserFromDB,
  deleteUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Created...",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUser = async (req, res) => {
  try {
    const result = await userService.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromBD(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserFromDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id);
    console.log(result);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "User delete successfully",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import Jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access !!!"
        });
      }
      const decoded = await Jwt.verify(token, config_default.secret);
      console.log("decoded: ", decoded);
      const userData = await pool.query(`
                SELECT * FROM users WHERE email=$1
            `, [decoded.email]);
      if (userData.rows[0] === 0) {
        res.status(404).json({
          success: false,
          message: "User not found..."
        });
      }
      const user = userData.rows[0];
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden..."
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(401).json({
          success: false,
          message: "Forbidden..."
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  admin: "admin",
  agent: "agent",
  user: "user"
};

// src/modules/user/user.route.ts
var router = Router();
var userRoute = router;
router.post("/", userController.createUser);
router.get("/", auth_default(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user), userController.getAllUser);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import Jwt2 from "jsonwebtoken";
var authLoginIntoBD = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);
  const user = result.rows[0];
  if (result.rows.length === 0) {
    throw new Error("User not found... please Register...");
  }
  const matchPassword = await bcrypt2.compare(password, result.rows[0].password);
  if (!matchPassword) {
    throw new Error("Invalid Creadential!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.is_active,
    role: user.role
  };
  const accessToken = Jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  const refreshToken2 = Jwt2.sign(jwtPayload, config_default.refresh_secret, { expiresIn: "1d" });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateAccessToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized Access...");
  }
  const decoded = await Jwt2.verify(token, config_default.refresh_secret);
  const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
        `, [decoded.email]);
  const user = userData.rows[0];
  if (!user) {
    throw new Error("User Not Found...");
  }
  if (!user.is_active) {
    throw new Error("User not Activated...");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.is_active,
    role: user.role
  };
  const accessToken = await Jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return { accessToken };
};
var authService = {
  authLoginIntoBD,
  generateAccessToken
};

// src/modules/auth/auth.controller.ts
var authLogin = async (req, res) => {
  try {
    const result = await authService.authLoginIntoBD(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(201).json({
      message: "json web token generated",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateAccessToken(req.cookies.refreshToken);
    res.status(201).json({
      success: true,
      message: "Access Token created...",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  authLogin,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.authLogin);
router2.post("/refresh-token", authController.refreshToken);
var authRoute = router2;

// src/modules/profile/profile.route.ts
import { Router as Router3 } from "express";

// src/modules/profile/profile.service.ts
var createProfileIntoDB = async (payload) => {
  const { user_id, email, bio, address, gender, phone } = payload;
  const userFromDB = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [user_id]);
  const user = userFromDB.rows[0];
  if (user.email !== email) {
    throw new Error("User Creadential Invalid...");
  }
  const result = await pool.query(`
            INSERT INTO profiles(user_id, name, bio, address, phone, gender) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
            `, [user_id, user.name, bio, address, phone, gender]);
  return result;
  ;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/profile/profile.controller.ts
var profileCreate = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfull...",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var profileController = {
  profileCreate
};

// src/modules/profile/profile.route.ts
var router3 = Router3();
router3.post("/", profileController.profileCreate);
var profileRoute = router3;

// src/app.ts
import CookieParsar from "cookie-parser";

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method}, URL -> ${req.url}, Date -> ${Date.now()}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cors from "cors";

// src/middleware/globalErroHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErroHandler_default = globalErrorHandler;

// src/app.ts
var app2 = express();
app2.use(CookieParsar());
app2.use(express.json());
app2.use(express.text());
app2.use(express.urlencoded({ extended: true }));
app2.use(logger_default);
app2.use(cors({
  origin: "http://localhost:3000"
}));
app2.get("/", (req, res) => {
  res.status(200).json({
    "message": "This is the root of the server!",
    "author": "Next Level"
  });
});
app2.use("/api/users", userRoute);
app2.use("/api/profiles", profileRoute);
app2.use("/api/auth", authRoute);
app2.use(globalErroHandler_default);
var app_default = app2;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map