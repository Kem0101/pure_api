/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import 'mongoose-pagination'
import  { type Response, type Request } from 'express'
import Follow from '../models/follow'
import { IFollow } from './interfaces'
import { logError } from '../helpers/loggers'

// METHOD TO SAVE THE TRACKING TO A USER
async function saveFollow(req: Request | any, res: Response) {
  const { followed } = req.body
 
  try {
    const follow = new Follow({ user: req.user, followed }) as IFollow
    const followStored = await follow.save()
    if (!followStored) {
      return res.status(500).json({ msg: 'No se ha podido seguir al usuario' })
    }

    return res.status(200).json({ followStored })
    
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}

// METHOD TO STOP FOLLOWING A USER
function deleteFollow(req: Request | any, res: Response) {
  
  const userId = req.user._id
  const followId = req.params.id

  try {
    const removed = Follow.findOneAndRemove({ user: userId, followed: followId })
    if(!removed){
      return res.status(404).json({ msg: 'No se encontro el seguimiento para eliminar'})
    }
    
    return res.status(200).json({ msg: 'Ha dejado de seguir este usuario!' })

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}

// METHOD TO LIST THE USERS I FOLLOW
function getFollowingUser(req: Request | any, res: Response) {
  const userId = req.params.id || req.user._id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5
  
 try {
  const usersFollowed = Follow.find({ user: userId })
  .populate({ path: 'followed' })
  .paginate(page, itemsPerPage)

  if(!usersFollowed || !usersFollowed.docs){
    return res.status(404).json({ msg: 'No estas siguiendo a ningun usuario' })
  }
    
  return res.status(200).json({
    total: usersFollowed.totalDocs,
    pages: Math.ceil(usersFollowed.totalDocs / itemsPerPage),
    follows: usersFollowed.docs
  })

 } catch (error) {
  logError(error)
  return res.status(500).json({ msg: 'Error interno del API'})
 }
}
    


// METHOD TO LIST THE USERS THAT FOLLOW ME
function getFollowedUsers(req: Request | any, res: Response) {
  const userId = req.params.id || req.user._id
  const page = req.params.page || 1
  const itemsPerPage = 5

  try {
    const usersFollowedMe = Follow.find({ followed: userId })
    .populate({ path: 'user' })
    .paginate(page, itemsPerPage)

  if(!usersFollowedMe){
    return res.status(404).json({ msg: 'No tienes ningun seguidor'})
  }

  return res.status(200).json({
    total: usersFollowedMe.totalDocs,
    pages: Math.ceil(usersFollowedMe.totalDocs / itemsPerPage),
    follows: usersFollowedMe.docs
  })
  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}
    


// METHOD TO RETURN LIST OF USERS WITHOUT PAGINATION
async function getMyFollows(req: Request | any, res: Response) {
  const userId = req.user._id
  const userToFind = req.params.id

  try {

    const query: { followed: string; user?: string } = {followed: userId}
    if (userToFind) {
      query.user = userToFind
    }

    const follows = await Follow.find(query)
      .populate({ path: 'user', select: '-role -token -confirmed -_id -username -email -password -__v' })
      .exec()
    
    if (!follows) {
      return res.json({ msg: 'No hay usuarios para visualizar' })
    }
    
    return res.json({ follows })

  } catch (error) {
    logError(error)
    return res.status(500).json({ msg: 'Error interno del API'})
  }
}

export default {
  saveFollow,
  deleteFollow,
  getFollowingUser,
  getFollowedUsers,
  getMyFollows,
}
