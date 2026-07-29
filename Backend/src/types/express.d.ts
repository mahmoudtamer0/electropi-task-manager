import { Types } from "mongoose";
import { User } from "./user";


export type Role = "ADMIN" | "USER" | "MODERATOR";

declare global {
    namespace Express {

        interface Request {
            user?: User;
        }
    }
}
export { };