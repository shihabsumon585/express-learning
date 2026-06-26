import type { NextFunction, Request, Response } from "express";
import fs from "fs";


const logger = (req: Request, res: Response, next: NextFunction) => {
  // console.log('Time:', Date.now());
  const log = `\nMethod -> ${req.method}, URL -> ${req.url}, Date -> ${Date.now()}\n`;
  fs.appendFile("logger.txt", log, (err) => {})
  next();
};

export default logger;