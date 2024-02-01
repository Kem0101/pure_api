'use strict';

import mongoose from 'mongoose';

const FollowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Follow = mongoose.model('Follow', FollowSchema);
export default Follow;
