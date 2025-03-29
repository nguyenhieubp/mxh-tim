import { IUser } from "./user";

export interface IComment {
    id: number;
    content: string;
    user: IUser;
    createdAt: string;
  }
  