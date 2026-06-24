// const express = require('express');
import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";
const app: Application = express()
const port = 5000

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_VSfYNG7nE0iX@ep-hidden-fog-atpi7y01.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
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
    console.log("From init DB: ", error)
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

app.post("/api/users", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, email, password, age } = req.body;
  // console.log({ name, email, password, age })

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


app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
        SELECT * FROM users
      `)
    res.status(200).json({
      success: true,
      message: "Users retrived successfully!",
      data: result.rows
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})

app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id); // undefined... but why?
  try {
    const result = await pool.query(`
        SELECT * FROM users WHERE id=$1
      `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      })
      return;
    }

    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;

  try {
    const result = await pool.query(`
      UPDATE users SET name=$1,password=$2,age=$3,is_active=$4 WHERE id=$5 RETURNING *
    `, [name, password, age, is_active, id])
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      })
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})