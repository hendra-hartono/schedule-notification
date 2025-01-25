import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

const { NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
  process.env;

if (
  !NODE_ENV ||
  !DB_HOST ||
  !DB_PORT ||
  !DB_USERNAME ||
  !DB_PASSWORD ||
  !DB_NAME
)
  throw new Error(
    "NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME must be defined."
  );

import { User } from "../models/user";
import { NotificationHistory } from "../models/notificationHistory";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: NODE_ENV === "development" ? true : false,
  logging: NODE_ENV === "development" ? false : false,
  entities: [User, NotificationHistory],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [],
});
