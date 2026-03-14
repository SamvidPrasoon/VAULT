import "dotenv/config";
import { Pool } from "pg";
import { getEnv } from "../utility/env.js";

const pool = new Pool({
  host: getEnv("DB_HOST"),
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: getEnv("DB_NAME"),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD"),

  // production settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connection established");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
  process.exit(1);
});

export default pool;
