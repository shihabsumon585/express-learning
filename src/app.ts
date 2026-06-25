// const express = require('express');
import express, { type Application, type Request, type Response } from "express";
import config from "./config";
import { initDB, pool } from "./db";
const app: Application = express()

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));



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
      UPDATE users 
      SET 
      name=COALESCE($1, name),
      password=COALESCE($2, password),
      age=COALESCE($3, age),
      is_active=COALESCE($4, is_active)
      WHERE id=$5 RETURNING *
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

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
        DELETE FROM users WHERE id=$1
      `, [id]);
    console.log(result)
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {}
      })
    }
    res.status(200).json({
      success: true,
      message: "User delete successfully",
      data: {}
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})
export default app;