// require('dotenv').config() //code is not consistent
import mongoose from "mongoose";
import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js'

dotenv.config({
    path: './env'
})

connectDB()
.then(() =>{
  app.listen(process.env.PORT || 3000, ()=>{
    console.log(`App is listening on port: ${process.env.PORT || 3000}`);
  })
})
.catch((err) =>{
  console.error("Error connecting to MongoDB:", err);
  throw err;
})

/*
import express from "express";
const app= express();

// can start iife with semicolon
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGOFB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
        console.log("ERRR:", error);
        throw error
    })
    app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
}
})();
*/