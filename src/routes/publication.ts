'use strict'

import express from 'express'
import PublicationController from '../controllers/publication'
import md_auth from '../middlewares/authentication'

const api = express.Router()

api.post('/publication', md_auth, PublicationController.savePublication)
api.get('/publications/:page?', md_auth, PublicationController.getPublications)
api.get('/publication/:id', md_auth, PublicationController.getPublication)
api.delete('/publication/:id', md_auth, PublicationController.deletePublication)

export default api
