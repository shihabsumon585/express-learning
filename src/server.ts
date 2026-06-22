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

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `)
    console.log("Database connected successfully!")
  } catch (error) {
    console.log(error)
  }
}
initDB();

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!')
  res.status(200).json({
    "message": "This is the root of the server!",
    "author": "Next Level"
  })
})

app.post("/", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, email, password, age } = req.body;
  console.log({ name, email, password, age })

  try {
    const result = await pool.query(`
      INSERT INTO users(name, email, password, age) VALUES($1, $2, $3, $4) RETURNING *
    `, [name, email, password, age]);

    // console.log(result);

    res.status(201).json({
      message: "Created...",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(201).json({
      message: error.message,
      error: error
    })
  }
})

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })