'use strict';

import mongoose, { Error } from 'mongoose';
// import message from '../controllers/message';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connection to the database

const conectionDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const url = `${db.connection.host}:${db.connection.port}`;
    console.log(`Connection to the database success: ${url}`);
  } catch (err) {
    const typedError = err as Error;

    console.log(typedError?.message);
  }
};

export default conectionDB;
