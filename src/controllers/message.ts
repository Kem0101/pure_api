/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import moment from 'moment'
import 'mongoose-pagination'
import { type Request, type Response } from 'express'

import Message from '../models/message'
import { IMessage } from './interfaces'

// METODO PARA GUARDAR NUEVOS MENSAJES
function saveMessage(req: Request | any, res: Response) {
  const data = req.body

  if (!data.text || !data.receiver)
    return res.status(200).send({ message: 'Enviar los datos necesarios' })

  const message = new Message() as IMessage
  message.emitter = req.user
  message.receiver = data.receiver
  message.text = data.text
  message.created_at = moment().unix()
  message.viewed = 'false'

  const messageStored = message.save()
  if (!messageStored) {
    const error = new Error('Error al enviar el mensaje')
    return res.json({ msg: error.message })
  }

  try {
    return res.json({ msg: messageStored })
  } catch (error) {
    console.log(error)
  }
}

// METODO PARA VER(listar) LOS MENSAJES RECIBIDOS
function getReceiveMessages(req: Request | any, res: Response) {
  const userId = req.user

  let page = 1
  if (req.params.page) {
    page = parseInt(req.params.page)
  }

  const itemPerPage = 5

  const messageQuery = Message.find({ receiver: userId })
    // En pupulate me permite pasar un segundo parametro especificando cuales campos quiero devolver en la vista
    messageQuery
    .populate('emitter', '_id fullname image')
    .paginate(
      page,
      itemPerPage,
      (err: string, retrievedMessages: IMessage[], total: number) => {
        if (err) {
          const error = new Error('Error en la petición')
          return res.json({ msg: error.message })
        }

        if (!retrievedMessages) {
          const error = new Error('No hay mensajes')
          return res.json({ msg: error.message })
        }

        return res.json({
          total: total,
          pages: Math.ceil(total / itemPerPage),
          retrievedMessages,
        })
      }
    )
}

// METODO PARA VER(listar) LOS MENSAJES QUE HE ENVIADO
function getEmmittedMessages(req: Request | any, res: Response) {
  const userId = req.user

  let page = 1
  if (req.params.page) {
    page = parseInt(req.params.page)
  }

  const itemPerPage = 5

  Message.find({ emitter: userId })
    // En pupulate me permite pasar un segundo parametro especificando cuales campos quiero devolver en la vista
    .populate('reveiver emitter', '_id name surname nick image')
    .paginate(
      page,
      itemPerPage,
      (err: string, messages: IMessage[], total: number) => {
        if (err) {
          const error = new Error('Error en la petición')
          return res.json({ msg: error.message })
        }

        if (!messages) {
          const error = new Error('No hay mensajes')
          return res.json({ msg: error.message })
        }

        return res.json({
          total: total,
          pages: Math.ceil(total / itemPerPage),
          messages,
        })
      }
    )
}

// METODO PARA CONTABILIZAR LOS MENSAJES NO LEIDOS
function getUnviewedMessages(req: Request | any, res: Response) {
  const userId = req.user

  Message.count({ receiver: userId, viewed: 'false' }).exec(
    (err: string, count: number) => {
      if (err) {
        const error = new Error('Error en la petición')
        return res.json({ msg: error.message })
      }

      return res.json({ unviewed: count })
    }
  )
}

// // METODO PARA ACTUALIZAR EL REGISTRO DE MENSAJES NO LEIDOS A CERO CUANDO YA HAYAN SIDO LEIDOS
// // REVISAR ESTE METODO
// function setViewedMessages(req: any, res: any) {
//   const userId = req.user.sub;

//   Message.update(
//     { receiver: userId, viewed: 'false' },
//     { viewed: 'true' },
//     { multi: 'true' },
//     (err: string, messagesUpdate: boolean) => {
//       if (err) return res.status(500).send({ message: 'Error en la petición' });

//       return res.status(200).send({ messages: messagesUpdate });
//     }
//   );
// }

export default {
  saveMessage,
  getReceiveMessages,
  getEmmittedMessages,
  getUnviewedMessages,
  // setViewedMessages,
}
