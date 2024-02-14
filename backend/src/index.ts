import express from "express";
import { config } from "dotenv";
config();

import { MongoClient } from "mongodb";
import { spaceRoutes } from "./space";
import { existsSync, readFileSync } from "fs";

const app = express();

if (!process.env.PORT) {
  console.warn("The PORT environment variable is not set. Defaulting to 3000.");
}

const port = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error(
    "The MONGODB_URI environment variable is not set. Defaulting to mongodb://127.0.0.1:27017"
  );
}
const mongoUrl = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

if (!process.env.PUBLIC_DIR) {
  console.error("The PUBLIC_DIR environment variable is not set.");
  process.exit(1);
}

async function main() {
  const dbClient = await MongoClient.connect(mongoUrl);
  const db = dbClient.db("heeecker-lists");

  if (!existsSync("./legal.txt")) {
    console.error("The legal.txt file does not exist. Please create it and add your imprint and privacy policy.");
    process.exit(1);
  }

  app.get("/api/legal", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(readFileSync("./legal.txt", "utf-8"));
  })

  app.use((req, res, next) => {
    // does it begin with /api?
    if (req.path.startsWith("/api")) {
      // if it does, then we should set the content type to application/json
      res.setHeader("Content-Type", "application/json");
      // and continue to the next middleware
      next();
      return;
    }
    // else, send the file the client requested from the public directory
    res.sendFile(req.path, { root: process.env.PUBLIC_DIR });
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  spaceRoutes(app, db);

  app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
