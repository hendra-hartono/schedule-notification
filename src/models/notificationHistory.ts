import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";

import { User } from "./user";

const EventTypes = ["birthday", "wedding-anniversary"];
type Event = (typeof EventTypes)[number];

@Entity({ name: "notification-histories" })
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  year: string;

  @Column({ type: "enum", enum: EventTypes })
  event: Event;

  @Column()
  isScheduled: boolean;

  @Column()
  isSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
