import { IConnection } from "../types/message.types";
import { User } from "../models/User";

export const activeConnections: IConnection[] = [];
export const users: User[] = [];
