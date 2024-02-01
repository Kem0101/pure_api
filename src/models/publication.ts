'use strict';

import mongoose from 'mongoose';

const PublicationSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  file: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Publication = mongoose.model('Publication', PublicationSchema);
export default Publication;
