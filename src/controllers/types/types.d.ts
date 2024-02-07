
import { IUser } from "../interfaces" 


declare namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
