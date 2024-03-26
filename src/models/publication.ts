'use strict'

import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IPublication } from 'src/controllers/interfaces'

const PublicationSchema = new mongoose.Schema({
  text: {
    type: String
  },
  file: {
    type: String
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

PublicationSchema.plugin(paginate)

const Publication = mongoose.model<
  IPublication,
  mongoose.PaginateModel<IPublication>
>('Publication', PublicationSchema)
export default Publication
