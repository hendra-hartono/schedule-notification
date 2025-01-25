const Queue = require("bull");
import { Job } from "bull";
import axios from "axios";
import dotenv from "dotenv";
import { AppDataSource } from "../services/db";
import { NotificationHistory } from "../models/notificationHistory";
dotenv.config();

const numberOfThreads = 1; // (can be adjusted depends on the needs)
const { DB_HOST, REDIS_PORT, EMAIL_SERVICE_BASE_URL } = process.env;

if (!DB_HOST || !REDIS_PORT || !EMAIL_SERVICE_BASE_URL)
  throw new Error(
    "DB_HOST, REDIS_PORT, EMAIL_SERVICE_BASE_URL must be defined."
  );

const emailQueue = new Queue("emailQueue", {
  redis: {
    host: DB_HOST,
    port: REDIS_PORT,
  },
  limiter: {
    // 10 jobs per 1 second (can be adjusted depends on the needs)
    max: 10,
    duration: 1000,
  },
});

emailQueue.process(
  "scheduleBirthdayNotif",
  numberOfThreads,
  async (job: Job) => {
    try {
      const { id, firstname, lastname, email, year, event } = job.data;
      const message = `Hey, ${firstname} ${lastname} it's your birthday.`;

      const { data: response } = await axios.post(
        EMAIL_SERVICE_BASE_URL + "/send-email",
        {
          email,
          message,
        }
      );

      if (response && response.status === "sent") {
        const historyRepo = AppDataSource.getRepository(NotificationHistory);
        await historyRepo.update({ user: id, year, event }, { isSent: true });
      } else {
        console.error(
          `Error sending email: Something to do with the email provider.`
        );
        // add logs || report to Sentry
      }
    } catch (error) {
      if (error instanceof Error)
        console.error(`Error sending email: ${error.message}`);
      // add logs || report to Sentry
    }
  }
);

emailQueue.process("insertHistory", numberOfThreads, async (job: Job) => {
  try {
    const { id, year, event } = job.data;
    const historyRepo = AppDataSource.getRepository(NotificationHistory);

    const history = new NotificationHistory();
    history.user = id;
    history.year = year;
    history.event = event;
    history.isScheduled = true;
    history.isSent = false;

    await historyRepo.save(history);
  } catch (error) {
    if (error instanceof Error)
      console.error(`Error inserting notification history: ${error.message}`);
    // add logs || report to Sentry
  }
});

// Error handling
emailQueue.on("failed", (job: Job, error: { message: string }) => {
  console.error(`Job ${job.id} failed: ${error.message}`);
  // add logs || report to Sentry
});

export default emailQueue;
