
import  { Document } from "mongoose"


export interface IUser extends Document {
  fullname: string
  username: string
  email: string
  password: string
  token: string | null
  role?: string | null
  image: string | null
  confirmed?: boolean

  authenticate: (password: string) => Promise<boolean>

  // paginate: (page: number, itemsPerPage: number) => Promise<void>
}

export interface IUserResponse extends Document {
  _id: string
  fullname: string
  username: string
  email: string
  password: string
  token: string | null
}


export interface IFollow extends Document {
  user: IUser 
  followed: IUser 
}

export interface IPublication extends Document {
  id?: string,
  text: string
  file: string
  created_at: Date
  user: IUser
  
}

export interface IMessage extends Document {
  text: string
  viewed: string
  created_at: number
  emitter: IUser
  receiver: IUser
}


