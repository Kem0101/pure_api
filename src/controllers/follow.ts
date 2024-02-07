/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import 'mongoose-pagination'
import  { type Response, type Request } from 'express'
import Follow from '../models/follow'
import { IFollow } from './interfaces'

// METHOD TO SAVE THE TRACKING TO A USER
async function saveFollow(req: Request | any, res: Response) {
  const data = req.body

  const follow = new Follow() as IFollow
  
  follow.user = req.user
  follow.followed = data.followed

  const followStored = await follow.save()
  if (!followStored) {
    const error = new Error('No se ha podido seguir al usuario')
    return res.status(500).json({ msg: error.message })
  }

  try {
    return res.json({ followStored })
  } catch (error) {
    console.log(error)
  }
}

// METHOD TO STOP FOLLOWING A USER
function deleteFollow(req: Request | any, res: Response) {
  // Capturar el id del usuario logueado
  const userId = req.user
  // Recoger el id del usuario a borrar(este viene como parametro por la URL)
  const followId = req.params.id

  Follow.find({ user: userId, followed: followId }).remove()
  try {
    return res.json({ msg: 'Ha dejado de seguir este usuario!' })
  } catch (error) {
    console.log(error)
  }
}

// METHOD TO LIST THE USERS I FOLLOW
function getFollowingUser(req: Request | any, res: Response) {
  let userId = req.user
 // Validate if the URL gives me any id then use it as a reference by replacing the value of
  // userId by the id that I received as a parameter
  if (req.params.id && req.params.page) {
    userId = req.params.id
  }

  let page = 1
  if (req.params.page) {
    page = parseInt(req.params.page)
  }

  const itemsPerPage = 5

  Follow.find({ user: userId })
    .populate({ path: 'followed' })
    .paginate(
      page,
      itemsPerPage,
      (err: string, follows: IFollow[], total: number) => {
        if (err) {
          const error = new Error('Error en el servidor')
          return res.json({ msg: error.message })
        }

        if (!follows) {
          const error = new Error('No estas siguiendo ningun usuario')
          return res.json({ msg: error.message })
        }

        return res.json({
          total: total,
          pages: Math.ceil(total / itemsPerPage),
          follows,
        })
      }
    )
}

// METHOD TO LIST THE USERS THAT FOLLOW ME
function getFollowedUsers(req: Request | any, res: Response) {
  let userId = req.user
  // Validate if the URL gives me any id then use it as a reference by replacing the value of
  // userId by the id that I received as a parameter
  if (req.params.id && req.params.page) {
    userId = req.params.id
  }

  let page = 1
  if (req.params.page) {
    page = req.params.page
  }

  const itemsPerPage = 5

  Follow.find({ followed: userId })
    .populate({ path: 'user' })
    .paginate(
      page,
      itemsPerPage,
      (err: string, follows: IFollow[], total: number) => {
        if (err) {
          const error = new Error('Error en el servidor')
          return res.json({ msg: error.message })
        }

        if (!follows) {
          const error = new Error('No estas siguiendo ningun usuario')
          return res.json({ msg: error.message })
        }

        return res.status(200).send({
          total: total,
          pages: Math.ceil(total / itemsPerPage),
          follows,
        })
      }
    )
}

// METHOD TO RETURN LIST OF USERS WITHOUT PAGINATION
function getMyFollows(req: Request | any, res: Response) {
  const userId = req.user

  let find = Follow.find({ user: userId })

  if (req.params.followed) {
    find = Follow.find({ followed: userId })
  }

  const follows = find.populate('user followed').exec()
  if (!follows) {
    const error = new Error('No hay usuarios para visualizar')
    return res.json({ msg: error.message })
  }

  try {
    return res.json({ follows })
  } catch (error) {
    console.log(error)
  }
}

export default {
  saveFollow,
  deleteFollow,
  getFollowingUser,
  getFollowedUsers,
  getMyFollows,
}
