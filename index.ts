import express, { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import conectionDB from './src/config/database'
import userRoutes from './src/routes/user'
import publicationRoutes from './src/routes/publication'
import bodyParser from 'body-parser'
import messageRoutes from './src/routes/message'
import followRoutes from './src/routes/follow'

const app = express()
dotenv.config() // dotenv para configurar variables de entornos
conectionDB() // llamando a la función que hace la conexion con la base de datos en database.ts


// Configurate Headers and Cors
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL)
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
  )
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

// Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Upload Routes
// // Rutas
app.use('/api', userRoutes)
app.use('/api', publicationRoutes)
app.use('/api', messageRoutes)
app.use('/api', followRoutes)

// Static Server
app.use(express.static('public'))

// Server listening on port x
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`)
})
