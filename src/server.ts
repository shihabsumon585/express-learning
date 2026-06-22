// const express = require('express');
import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";
const app: Application = express()
const port = 5000

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: ""
})

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!')
  res.status(200).json({
    "message": "This is the root of the server!",
    "author": "Next Level"
  })
})

app.post("/", (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, ID, password } = req.body;
  res.status(201).json({
    message: "Created...",
    data: {
      name,
      ID
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})