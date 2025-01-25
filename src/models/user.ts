import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Not,
  Raw,
  IsNull,
  In,
} from "typeorm";

import { NotificationHistory } from "./notificationHistory";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  firstname: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false, type: "date" })
  birthdate: string;

  @Column({ nullable: false })
  location: string;

  @OneToMany(() => NotificationHistory, (notifHistory) => notifHistory.user)
  notifHistories: NotificationHistory[];
}

export { Not, Raw, IsNull, In };
