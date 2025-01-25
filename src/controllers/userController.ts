import { Request, Response } from "express";
import moment from "moment-timezone";
import { AppDataSource } from "../services/db";
import { User, In } from "../models/user";
import { NotificationHistory } from "../models/notificationHistory";

export const fetchTimezone = (req: Request, res: Response) => {
  const zones = moment.tz.names();
  res.send({
    message: "Fetched all timezones",
    data: zones,
  });
};

export const fetchUsers = async (req: Request, res: Response) => {
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  const userRepo = AppDataSource.getRepository(User);
  const [users, count] = await userRepo.findAndCount({
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched users",
    data: users,
    meta: {
      totalItems: count,
      itemCount: users.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, birthdate, location } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const userExists = await userRepo.findOne({ where: { email } });
    if (userExists) {
      res.status(400).json({ message: "Email has already existed" });
      return;
    }

    const zones = moment.tz.names();
    if (!zones.includes(location)) {
      res.status(404).json({ message: "Location (Timezone) is not found" });
      return;
    }

    const user = new User();
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.birthdate = birthdate;
    user.location = location;

    await userRepo.save(user);

    res.send({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, birthdate, location } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const historyRepo = AppDataSource.getRepository(NotificationHistory);

    const user = await userRepo.findOne({ where: { id: req.params.id } });
    if (!user) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    const zones = moment.tz.names();
    if (!zones.includes(location)) {
      res.status(404).json({ message: "Location (Timezone) is not found" });
      return;
    }

    // If birthdate is updated, then alter the notification record
    if (user.birthdate != birthdate) {
      const currentYear = moment().format("YYYY");
      const currentDate = moment().format("YYYY-MM-DD");
      const newBirthday = currentYear + "-" + moment(birthdate).format("MM-DD");

      if (moment(newBirthday).isAfter(currentDate)) {
        await historyRepo.delete({
          user,
          year: currentYear,
          event: In(["birthday"]),
        });
      }
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.birthdate = birthdate;
    user.location = location;
    await userRepo.save(user);

    res.send({
      message: "User updated successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.params.id } });
    if (!user) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    await userRepo.remove(user);

    res.send({
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete user" });
  }
};
