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
  
  const { fullname, username, email, password  } = req.body

  try {
  // Prevent duplicate user
    const existUser = await User.findOne({ email })
    if (existUser) {
      return res.status(400).json({ msg: 'Email no disponible' })
    }

    const user = new User({ fullname, username, email, password }) as IUser
    const userSaved: IUser = await user.save()

    // Send email confirmation
    await emailRegister({
      email,
      fullname,
      token: userSaved.token,
    })

    return res.status(201).json({ msg: 'Usuario creado con exito' })

  } catch (error: unknown) {
    logError(error)  
    return res.status(500).json({ error, msg: 'Error interno del API'})  
  }
}


async function userConfirm(req: Request, res: Response) {
  
  const { token } = req.params

  try {
    const confirm = await User.findOne({ token })
    if (confirm === null) {
      return res.status(404).json({ msg: 'Token no valido' })
    }
    
    (confirm.token = null), (confirm.confirmed = true)
    await confirm.save()

    res.status(200).json({ msg: 'Usuario confirmado correctamente' })
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}

// USER LOGIN
async function userLogin(req: Request, res: Response) {
  
  const { email, password } = req.body

  try {
    const existUser = await User.findOne({ email })
    if (existUser == null) {
        return res.status(404).json({ msg: 'El usuario no existe' })
    }
    // Check if the user has confirmed his account
    if (!existUser.confirmed) {
        return res.status(401).json({ msg: 'Tu cuenta no ha sido confirmada' })
    }

    const isPasswordCorrect = await existUser.authenticate(password)
    if (!isPasswordCorrect) { 
        return res.status(401).json({ msg: 'La contraseña es incorrecta'})
    }
    // Authenticate user
    return res.status(200).json({
      _id: existUser._id,
      fullname: existUser.fullname,
      email: existUser.email,
      token: generateJWT(existUser._id),
    })
    
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}

// User Profile, this method takes the user to the home page after authentication 
function homeUser(req: Request, res: Response) {
  const { user }: any = req

  return res.status(200).json(user)
}


async function forgotPassword(req: Request, res: Response) {
  
  const { email } = req.body

  try {
    const existUser = await User.findOne({ email })
    if (existUser == null) {
      return res.status(404).json({ msg: 'El usuario no existe' })
    }

    existUser.token = generateId()
    await existUser.save()

    // Send email with instructions
    await emailOlvidePassword({
      email,
      fullname: existUser.fullname,
      token: existUser.token,
    })

    return res.status(200).json({ msg: 'Hemos enviado un email con los pasos para cambiar la contraseña' })

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}


// Method to check password
async function checkToken(req: Request, res: Response) {
  const { token } = req.params

  try {
    const validToken = await User.findOne({ token })
    if (validToken !== null) {
      return res.status(200).json({ msg: 'Token válido' })
    } else {
      return res.status(400).json({ msg: 'Token no válido' })
    }
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}


// Method to assign a new password
async function newPassword(req: Request, res: Response) {
  
  const { token } = req.params
  const { password } = req.body

  if(!password || password < 7){
    return res.status(400).json({ msg: 'La contraseña debe ser de al menos 7 dígitos'})
  }

  try {
    const user = await User.findOne({ token })
    if (user === null) {
      return res.status(400).json({ msg: 'Token inválido o expiró' })
    }
    
    user.token = null
    user.password = password
    await user.save()

    return res.status(200).json({ msg: 'Password modificado correctamente' })

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}


// METHOD TO EXTRACT USER DATA
// THIS METHOD IS PENDING TO BE REVIEWED, IT CURRENTLY FETCHES THE USER REQUESTED BY ITS ID BUT
// THE VALUE OBJECT THAT IT SHOULD BRING IF IT FOLLOWS AND IS FOLLOWED BY THE USER THAT IS LOGGED IN, IS EMPTY.
async function getUser(req: Request | any, res: Response) {
  const userId = req.params.id
  const userLog = req.user._id

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ msg: 'El usuario no existe' })
    }

    const { password, token, role, confirmed, image, __v, ...userResponse } = user.toObject()

    // This next code block let me know if I am following this user and if he/she is following me
    await followThisUser(userLog, userId).then((value) => {
      user.password == undefined
      return res.status(200).json({ userResponse, value })
    })
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
  
}


// METHOD FOR RETURNING A LIST OF PAGINATED USERS (Check the pagination)
async function getUsers(req: Request | any, res: Response) {
 
  const identityId = req.user
  const page = req.params.page || 1

  const options = {
    page: page,
    limit: 5
  }
   
  try {
    const users = await User.paginate({}, options)
    if(!users || !users.docs){
      return res.send(404).json({ msg: 'No hay usuarios disponibles' })
    }

    const userResponse = users.docs.map(({ passwor, role, image,token, confirmed, __v, ...user }) => user)
    

    const { following, followed } = await followUserIds(identityId)
      return res.status(200).json({
        users: userResponse,
        user_following: following,
        user_followed_me: followed,
        total: users.totalDocs,
        pages: users.totalPages
      }) 
  }    
  catch (error: unknown) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}


// METHOD TO COUNT THE USERS I FOLLOW, THOSE WHO FOLLOW ME AND PUBLICATIONS
async function getCounters(req: Request | any, res: Request | any) {

  const userId = req.params.id || req.user._id

  try {
    const value = await getCountFollow(userId)
    if(!value) {
      return res.status(500).json({ msg: 'Algo salio mal'})
    }else {
      return res.status(200).json({ value })
    }

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
    
  
}

// METHOD TO UPDATE A USER'S DATA
async function updateUser(req: Request | any, res: Response) {
  
    const userId = req.params.id
    const userIdentity = req.user._id
    const update = { ...req.body }

  // Delete the password that comes in the user request
    delete update.password
    
    if (userIdentity.toString() !== userId) {
      return res.status(403).json({ msg: 'No tienes permiso para actualizar este usuario' })
    }

    try {

    const userUpdated = await User.findByIdAndUpdate(userId, update, { new: true })
    if (!userUpdated) {
      return res.status(404).json({ msg: 'No se ha podido actualizar el usuario' })
    }

    const { password, token, role, confirmed, image, __v, ...newUser } = userUpdated.toObject()
    
    return res.status(200).json({ user: newUser })

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
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

const getCountFollow = async (userId: object) => {
  try {
    // I did it in two ways. "following" with callback of countDocuments and "followed" with a promise
    const following = await Follow.countDocuments({ user: userId })
    const followed = await Follow.countDocuments({ followed: userId })
    const publication = await Publication.countDocuments({ user: userId})

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
