'use strict';

import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  viewed: {
    type: String,
    default: false,
  },
  created_at: {
    type: String,
  },
  emitter: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;
