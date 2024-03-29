/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import generateId from '../helpers/generateId'
import { IUser } from 'src/controllers/interfaces'
import paginate from 'mongoose-paginate-v2'

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Name required'],
    trim: true
  },

  username: {
    type: String,
    required: [true, 'Username required'],
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Password required']
  },

  role: {
    type: String,
    default: null
  },

  image: {
    type: String,
    default: null
  },
  token: {
    type: String,
    default: generateId()
  },
  confirmed: {
    type: Boolean,
    default: false
  }
})

//  Este bloque de codigo es una especie de middleware que hashea el password antes de almacenar
//  el objeto user,
//  la condicion dice que si el objeto ya ha sido hasheado al modificarse no vuelva a hashear el password
//  start
UserSchema.pre<any>('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})
// end

// Comprobar el password del usuario
UserSchema.methods.authenticate = function (passwordForm: string): boolean {
  return bcrypt.compareSync(passwordForm, (this as IUser).password)
}

UserSchema.plugin(paginate)

const User = mongoose.model<IUser, mongoose.PaginateModel<IUser>>(
  'User',
  UserSchema
)
export default User
