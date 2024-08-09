import "dotenv/config";
import "module-alias/register.js";

import express from "express";
import cors from "cors";
import database from "./src/config/database.config.js";

//constants
const HOST_PORT = process.env.HOST_PORT;

const app = express();

// middleware
app.use(cors());
app.use("/static", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

database.connect();

app.listen(HOST_PORT, () =>
  console.log("Server is running on port: " + HOST_PORT)
);
