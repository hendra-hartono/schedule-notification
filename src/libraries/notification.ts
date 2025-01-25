import moment from "moment-timezone";
import { AppDataSource } from "../services/db";
import emailQueue from "../services/emailQueue";
import { User, Not, IsNull, Raw } from "../models/user";
import { NotificationHistory } from "../models/notificationHistory";

export const birthday = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({
    where: [
      {
        notifHistories: {
          user: IsNull(),
        },
      },
      {
        notifHistories: {
          year: Not(new Date().getFullYear().toString()),
          event: "birthday",
        },
      },
    ],
  });

  users.map((user) => {
    const birthdate = moment.tz(user.birthdate, user.location);
    const current = moment.tz(user.location);
    const currentYear = current.format("YYYY");

    const check = moment(currentYear + "-" + birthdate.format("MM-DD")).isSame(
      moment(current.format("YYYY-MM-DD"))
    );

    if (check) {
      const payload = { ...user, ...{ year: currentYear, event: "birthday" } };

      // Send at 9 am
      emailQueue.add("scheduleBirthdayNotif", payload, {
        repeat: { cron: "0 9 * * *", tz: user.location, limit: 1 },
      });

      emailQueue.add("insertHistory", payload);
    }
  });
};

export const unsentBirthday = async () => {
  const timeWiindow = 1; // 1 day
  const historyRepo = AppDataSource.getRepository(NotificationHistory);
  const users = await historyRepo.find({
    where: {
      isSent: false,
      event: "birthday",
      year: new Date().getFullYear().toString(),
      createdAt: Raw(
        (alias) => `DATE_PART('day', NOW() - ${alias}) >= ${timeWiindow}`
      ),
    },
    relations: ["user"],
  });

  users.map((user) => {
    const payload = { ...user.user, ...{ year: user.year, event: user.event } };
    emailQueue.add("scheduleBirthdayNotif", payload);
  });
};

// export const weddingAnniversary = async () => {};
