/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict'

import { Request, Response } from 'express'
import 'mongoose-pagination'

import Publication from '../models/publication'
import Follow from '../models/follow'
import { IFollow, IPublication, IUser } from './interfaces'


async function savePublication(req: Request | any, res: Response) {
  try {
    const { text, file, userId } = req.body

    if(userId !== req.user.id){
      return res.status(403).json({ msg: 'No tienes permiso para realizar esta operación' })
    }

    if (!text && !file) {
      return res.status(400).json({ msg: 'La publicación no puede estar vacía' })
    }
    
    const publication = new Publication({ text, file, user: req.user.id}) as IPublication
    const publicationSaved = await publication.save()
    res.status(201).json(publicationSaved) 
    
  } catch (error) {
    return res.status(500).json({ msg: 'Error interno del servidor'})
  }
}

// TIMELINE PUBLICATIONS METHOD 
async function getPublications(req: Request | any, res: Response) {

  try {
    const identityId = req.user
    const page = req.params.page | 1

    const paginationOptions = {
      page,
      limit: 5,
      sort: { createdAt: -1 }, 
      populate: { path: 'user', select: ''},
      select: '',
    }

    const follows = await Follow.find({ user: identityId }).populate('followed')
    if (!follows) {
      return res.status(400).json({ msg: 'Error al devolver seguimiento' })
    }

    const follows_clean: IUser[] = follows.reduce((acc: any, follow: IFollow) => {
      if(follow.followed && typeof follow.followed === 'object'){
        acc.push(follow.followed)
      }
      return acc
    }, []) 
    
    const searchCriteria = { user: { $in: follows_clean }}
    const publications = await Publication.paginate(searchCriteria, paginationOptions)
    if (!publications || !publications.docs) {
      return res.status(404).json({ msg: 'No hay publicaciones' })
    }
    
    const publicationsToDisplay = publications.docs.map(publication => {
      const { password, token, role, _id, email, username, confirmed, __v, ...user } = publication.toObject().user
      return { ...publication.toObject(), user}
    })
      
    return res.status(200).send({ publicationsToDisplay })        
   
  } catch (error) {
    return res.status(500).json({ msg: 'Error interno del servidor'})
  }
  
}

// // METODO PARA DEVOLVER UNA PUBLICACION EN CONCRETO
async function getPublication(req: Request, res: Response) {

  try {
    const publicationId = req.params.id

    const publication = await Publication.findById(publicationId)
    if (!publication) return res.status(404).json({ msg: 'No existe la publicación' })

    return res.status(200).json({ publication })
    
  } catch (error) {
    return res.status(500).json({ msg: 'Error interno del servidor'})
  }
}


async function deletePublication(req: Request | any, res: Response) {
  try {
    const publicationId = req.params.id
    const userId = req.user.id

    const publicationRemoved = await Publication.findOneAndRemove({
      _id: publicationId,
      user: userId,
    })
    if (!publicationRemoved) {
      return res.json({ msg: 'Publicación no encontrada o no pertenece al usuario' })
    }

    return res.status(200).json({ publicationRemoved, msg: 'Publicación eliminada correctamente' })
    
  } catch (error) {
    return res.status(500).json({ msg: 'Error interno del servidor'})
  }
}


export default {
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
}
