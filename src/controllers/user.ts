/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'

import { type Request, type Response } from 'express'

import User from '../models/user'
import Follow from '../models/follow'
import Publication from '../models/publication'

import generateJWT from '../helpers/generateJWT'
import generateId from '../helpers/generateId'
import emailRegister from '../helpers/emailRegister'
import emailOlvidePassword from '../helpers/emailForgotPassword'

import { IFollow, IUser } from './interfaces'
import { logError } from '../helpers/loggers'

// --------------------------------------------------------
/**
 * 
 * @param req 
 * @param res 
 * @returns { IUser }
 */
async function saveUser(req: Request, res: Response) {
  const { email, fullname } = req.body

  // Prevent duplicate user
  const existUser = await User.findOne({ email })
  if (existUser) {
    const error = new Error('Email no disponible')
    return res.status(400).json({ msg: error.message })
  }

  try {
    const user = new User(req.body) as IUser
    const userSaved: IUser = await user.save()

    // Send email confirmation
    await emailRegister({
      email,
      fullname,
      token: userSaved.token,
    })

    return res.json(userSaved)
  } catch (error: unknown) {
    logError(error)    
  }
}


async function userConfirm(req: Request, res: Response) {
  const { token } = req.params

  const confirm = await User.findOne({ token })
  if (confirm === null) {
    const error = new Error('Token no valido')
    return res.status(404).json({ msg: error.message })
  }
  try {
    (confirm.token = null), (confirm.confirmed = true)
    await confirm.save()

    res.json({ msg: 'Usuario confirmado correctamente' })
  } catch (error) {
    logError(error)
  }
}

// // METODO PARA LOGUEAR UN USUARIO
async function userLogin(req: Request, res: Response) {
  const { email, password } = req.body

  const existUser = await User.findOne({ email })
  if (existUser == null) {
    const error = new Error('El usuario no existe')
    return res.status(404).json({ msg: error.message })
  }
  // Check if the user has confirmed his account
  if (!existUser.confirmed) {
    const error = new Error('Tu cuenta no ha sido confirmada')
    return res.status(401).json({ msg: error.message })
  }
  // Check if password is correct
  if ((await existUser.authenticate(password)) === true) {
    // Authenticate user
    return res.json({
      _id: existUser._id,
      fullname: existUser.fullname,
      email: existUser.email,
      token: generateJWT(existUser._id),
    })
  } else {
    const error = new Error('El password es incorrecto')
    return res.status(400).json({ msg: error.message })
  }
}

// User Profile, this method takes the user to the home page after authentication 
function homeUser(req: Request, res: Response) {
  const { user }: any = req

  return res.json(user)
}


async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body

  const existUser = await User.findOne({ email })
  if (existUser == null) {
    const error = new Error('El usuario no existe')
    return res.json({ msg: error.message })
  }

  try {
    existUser.token = generateId()
    await existUser.save()

    // Send email with instructions
    await emailOlvidePassword({
      email,
      fullname: existUser.fullname,
      token: existUser.token,
    })

    return res.json({
      msg: 'Hemos enviado un email con los pasos para cambiar la contraseña',
    })
  } catch (error) {
    logError(error)
  }
}


// Method to check password
async function checkToken(req: Request, res: Response) {
  const { token } = req.params

  const validToken = await User.findOne({ token })
  if (validToken !== null) {
    return res.json({ msg: 'Token válido y el usuario existe' })
  } else {
    const error = new Error('Token no válido')
    return res.json({ msg: error.message })
  }
}


// Method to assign a new password
async function newPassword(req: Request, res: Response) {
  const { token } = req.params
  const { password } = req.body

  const user = await User.findOne({ token })
  if (user == null) {
    const error = new Error('Hubo un error')
    return res.json({ msg: error.message })
  }
  try {
    user.token = null
    user.password = password
    await user.save()
    return res.json({ msg: 'Password modificado correctamente' })
  } catch (error) {
    logError(error)
  }
}


// METHOD TO EXTRACT USER DATA
// THIS METHOD IS PENDING TO BE REVIEWED, IT CURRENTLY FETCHES THE USER REQUESTED BY ITS ID BUT
// THE VALUE OBJECT THAT IT SHOULD BRING IF IT FOLLOWS AND IS FOLLOWED BY THE USER THAT IS LOGGED IN, IS EMPTY.
async function getUser(req: Request | any, res: Response) {
  const userId = req.params.id

  const user = await User.findById(userId)
    if (!user) {
      const error = new Error('El usuario no existe')
      return res.status(404).send({ msg: error.message })
    }

    const { password, token, role, confirmed, image, __v, ...userResponse } = user.toObject()

    // This next code block let me know if I am following this user and if he/she is following me
    await followThisUser(req.user._id, userId).then((value) => {
      user.password == undefined
      return res.json({ userResponse, value })
    })
  
}


// METHOD FOR RETURNING A LIST OF PAGINATED USERS (Check the pagination)
async function getUsers(req: Request | any, res: Response) {
 
  try {
    const identityId = req.user
    let page = 1

    if (req.params.page) {
      page = req.params.page
    }

    const itemsPerPage = 5

    const options = {
      page: page,
      limit: itemsPerPage
    }
   
    const users = await User.paginate({}, options)
    if(!users || !users.docs){
      const error = new Error('No hay usuarios disponibles')
      return res.send(404).json({ msg: error.message})
    }

    const userResponse = users.docs.map((user) => {
      const usersSinitized = user.toObject()
      delete usersSinitized.password
      delete usersSinitized.role
      delete usersSinitized.image
      delete usersSinitized.__v
      delete usersSinitized.token
      delete usersSinitized.confirmed
      return usersSinitized
    }) 

    followUserIds(identityId).then((value) => {
      return res.json({
        users: userResponse,
        user_following: value.following,
        user_followed_me: value.followed,
        total: users.totalDocs,
        pages: users.totalPages
      })
    })
  }    
  catch (error: unknown) {
    logError(error)
  }
}


// METHOD TO COUNT THE USERS I FOLLOW, THOSE WHO FOLLOW ME AND PUBLICATIONS
function getCounters(req: Request | any, res: Request | any) {
  let userId = req.user
  if (req.params.id) {
    userId = req.params.id
  }

  getCountFollow(userId).then((value) => {
    return res.json({ value })
  })
}

// METHOD TO UPDATE A USER'S DATA
async function updateUser(req: Request | any, res: Response) {
  
  const userId: string = req.params.id
  const userIdentity = req.user._id
  const update = req.body

// Delete the password that comes in the user request
  delete update.password
  
  if (userIdentity.toString() !== userId) {
    const error = new Error('No tienes permiso para actualizar este usuario')
    return res.json({
      msg: error.message,
    })
  }

  try {

    const userUpdated = await User.findByIdAndUpdate(userId, update, { new: true })
    if (!userUpdated) {
      const error = new Error('No se ha podido actualizar el usuario')
      return res.json({ msg: error.message })
    }

    const { password, token, role, confirmed, image, __v, ...newUser } = userUpdated.toObject()
    

    return res.json({ user: newUser })

  } catch (error) {
    logError(error)
  }
}



// Internal Controller Functions
async function followThisUser(identityUserId: string, userId: string) {
  try {
    const following = await Follow.findOne({
      user: identityUserId,
      followed: userId,
    }).then((follow: object) => {
      console.log(follow)
      return follow
    })

    const followed = await Follow.findOne({
      user: userId,
      followed: identityUserId,
    }).then((follow: IFollow) => {
      console.log(follow)
      return follow
    })

    return {
      following,
      followed,
    }
  } catch (error) {
    logError(error)
  }
}

async function followUserIds(userId: string) {
  const following = await Follow.find({ user: userId })
    .select({ _id: 0, __v: 0, user: 0 })
    .exec()
    .then((following: any) => {
      return following
    })
    .catch((error: unknown) => {
      logError(error)
    })

  const followed = await Follow.find({ followed: userId })
    .select({ _id: 0, __v: 0, followed: 0 })
    .exec()
    .then((followed: any) => {
      return followed
    })
    .catch((error: unknown) => {
      console.log(error)
    })

  // Procesar following ids
  const following_clean: any[] = []

  following.forEach((follow: any) => {
    following_clean.push(follow.followed)
  })

  // Procesar followed ids
  const followed_clean: any[] = []

  followed.forEach((follow: any) => {
    followed_clean.push(follow.user)
  })

  return {
    following: following_clean,
    followed: followed_clean,
  }
}

const getCountFollow = async (userId: string) => {
  try {
    // I did it in two ways. "following" with callback of countDocuments and "followed" with a promise
    const following = await Follow.countDocuments({ user: userId }).then(
      (count: any) => count,
    )
    const followed = await Follow.countDocuments({ followed: userId }).then(
      (count: any) => count,
    )
    const publication = await Publication.countDocuments({
      user: userId,
    }).then((count: any) => count)

    return { following, followed, publication }
  } catch (error) {
    logError(error)
  }
}



export default {
  saveUser,
  userConfirm,
  userLogin,
  homeUser,
  forgotPassword,
  checkToken,
  newPassword,
  getUser,
  getUsers,
  getCounters,
  updateUser,
}
