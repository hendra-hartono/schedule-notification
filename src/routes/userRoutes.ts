import express from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validateRequestMiddleware";
import {
  fetchTimezone,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/users", fetchUsers);

router.get("/users/timezone", fetchTimezone);

router.post(
  "/users",
  [
    body("firstname").notEmpty().withMessage("Firstname is required"),
    body("lastname").notEmpty().withMessage("Lastname is required"),
    body("email").notEmpty().isEmail().withMessage("Invalid Email"),
    body("birthdate").notEmpty().withMessage("birthdate is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  validateRequest,
  createUser
);

router.put(
  "/users/:id",
  [
    param("id").notEmpty().isUUID().withMessage("Invalid User Id"),
    body("firstname").notEmpty().withMessage("Firstname is required"),
    body("lastname").notEmpty().withMessage("Lastname is required"),
    body("email").notEmpty().isEmail().withMessage("Invalid Email"),
    body("birthdate").notEmpty().withMessage("birthdate is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  validateRequest,
  updateUser
);

router.delete(
  "/users/:id",
  [param("id").notEmpty().isUUID().withMessage("Invalid User Id")],
  validateRequest,
  deleteUser
);

export { router as userRouter };
