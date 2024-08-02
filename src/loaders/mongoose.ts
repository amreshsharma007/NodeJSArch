import mongoose from 'mongoose';
import { Db } from 'mongodb';
import config from '@/config';
import { Container } from 'typedi';

async function setUpMongoose(): Promise<Db> {
  const connection = await mongoose.connect(config.databaseURL, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
  });

  // Save the client for further use
  Container.set('mongoose', connection);

  // @ts-ignore
  return connection.connection.db;
}

export default setUpMongoose;
