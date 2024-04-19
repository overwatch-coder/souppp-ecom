import { UserType } from "@/models/user.model";
import { Mongoose } from "mongoose";

// Extend Express Request interface
declare global {
  namespace Express {
    export interface Request {
      user: UserType;
    }
  }
}
