/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict'

import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import 'mongoose-pagination'

import Publication from '../models/publication'
import Follow from '../models/follow'
import { IFollow, IPublication, IUser } from './interfaces'

// METODO PARA GUARDAR UNA PUBLICACION
async function savePublication(req: Request | any, res: Response) {
  const { text, file } = req.body

  if (!text && !file) {
    const error = new Error('La publicación no puede estar vacía')
    return res.json({ msg: error.message })
  }

  try {
    const publication = new Publication(req.body) as IPublication
    publication.user.id = req.user?.id
    const publicationSaved = await publication.save()
    res.json(publicationSaved)
  } catch (error) {
    console.log(error)
  }
}

// METODO PUBLICACIONES TIMELINE (sacar todas las publicaciones)
// REVISAR ESTE METODO
function getPublications(req: Request | any, res: Response) {
  let page = 1
  if (req.params.page) {
    page = parseInt(req.params.page)
  }
  const itemsPerPage = 5
  // let total: number

  Follow.find({ user: req.user })
    .populate('followed')
    .exec((err: string, follows: IFollow[]) => {
      if (err) {
        const error = new Error('Error al devolver seguimiento')
        return res.status(500).json({ msg: error.message })
      }

      const follows_clean: IUser[] = []

      follows.forEach((follow: IFollow) => {
        if(follow.followed && typeof follow.followed === 'object'){
          follows_clean.push(follow.followed)
        }
      })

      Publication.find({ user: { $in: follows_clean } })
        .sort('-creacted_at')
        .populate({ path: 'user', select: '-password -confirmed - role -__v',})
        .paginate(
          page,
          itemsPerPage,
          (err: string, publications: IPublication[], total: number) => {
            if (err) {
              const error = new Error('Error al devolver publicaciones')
              return res.status(500).json({ msg: error.message })
            }

            if (!publications) {
              const error = new Error('No hay publicaciones')
              return res.status(204).json({ msg: error.message })
            }

            // Eliminar la propiedad user.password de cada publicación
            publications = publications.map((publication) => {
              const newPublication = publication.toObject()
               // Extrae el objeto 'user' y elimina las propiedades no deseadas
            const { ...userResponse } = newPublication.user
            
            // Reemplaza 'user' con el nuevo objeto 'user' sin las propiedades eliminadas
            newPublication.user = userResponse

            // Devuelve el objeto modificado, que debe coincidir con la estructura de IPublication
            return newPublication as IPublication
            })

            return res.status(200).send({
              total_items: total,
              pages: Math.ceil(total / itemsPerPage),
              page: page,
              publications,
            })
          },
        )
    })
}

// // METODO PARA DEVOLVER UNA PUBLICACION EN CONCRETO
function getPublication(req: Request, res: Response) {
  const publicationId = req.params.id

  const publication = Publication.findById(publicationId)
  if (!publication) return res.json({ msg: 'No existe la publicación' })

  return res.json({ publication })
}

// METODO PARA ELIMINAR UNA PUBLICACION
function deletePublication(req: Request | any, res: Response) {
  const publicationId = req.params.id

  const publicationRemoved = Publication.find({
    user: req.user,
    _id: publicationId,
  }).remove()
  if (!publicationRemoved) {
    const error = new Error('No se ha borrado la publicación')
    return res.json({ msg: error.message })
  }

  try {
    return res.json({ msg: 'Publicación borrada correctamente' })
  } catch (error) {
    console.log(error)
  }
}


export default {
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
}
