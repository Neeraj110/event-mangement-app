import { IUserDocument } from "./types";

declare global {
  namespace Express {
    // Extend the User interface with our IUserDocument
    interface User extends IUserDocument {}
  }
}

export {};
