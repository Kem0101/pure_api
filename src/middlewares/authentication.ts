'use strict'

// Este middleware verifica si el token de la cabecera es valido y no ha espirado antes de
// dar acceso al usuario que hace la petición de login.

import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../models/user'
import * as dotenv from 'dotenv'
import { Request, Response, NextFunction } from 'express'
dotenv.config()

const checkAuth = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(
        token,
        process.env.SECRET_PASS as string,
      ) as JwtPayload

      req.user = await User.findById(decoded.id).select(
        '-password -token -confirmed',
      )

      return next()
    } catch (error) {
      const err = new Error('Token no válido')
      return res.json({ msg: err.message })
    }
  } else {
    const error = new Error('Token no válido o inexistente')
    return res.json({ msg: error.message })
  }

  next()
}
export default checkAuth
