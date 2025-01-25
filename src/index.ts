import express from "express";
import { json } from "body-parser";
import { CronJob } from "cron";
import { AppDataSource } from "./services/db";
import { userRouter } from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import { birthday, unsentBirthday } from "./libraries/notification";

const app = express();
app.use(json());
app.use(userRouter);
app.use(errorHandler);

// refetch the data every hour - we can set it to every 3, 6, 12 hours (can be adjusted depends on the needs)
new CronJob(
  "0 */1 * * *",
  function () {
    birthday();
    unsentBirthday();
  },
  null,
  true
);

const port = process.env.PORT || 4000;

AppDataSource.initialize().then(async () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}!!!`);
  });
});
