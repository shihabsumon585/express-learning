import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import fs from "fs"
import logger from "./middleware/logger";
const app: Application = express()

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!')
  res.status(200).json({
    "message": "This is the root of the server!",
    "author": "Next Level"
  })
})

app.use("/api/users", userRoute)
app.use("/api/profiles", profileRoute)
app.use("/api/auth", authRoute);


export default app;