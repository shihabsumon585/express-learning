import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import CookieParsar from "cookie-parser"
import logger from "./middleware/logger";
import cors from   "cors";
import globalErrorHandler from "./middleware/globalErroHandler";
const app: Application = express()


app.use(CookieParsar())
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cors({
  origin: "http://localhost:3000"
}))



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


app.use(globalErrorHandler);


export default app;