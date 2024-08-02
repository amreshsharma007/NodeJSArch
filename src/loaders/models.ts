import mongoose from 'mongoose';

function setUpModels(): {
  name: string;
  model: mongoose.Model<never>;
}[] {
  const userModel = {
    name: 'userModel',
    // Notice the required syntax and the '.default'
    model: require('../models/user').default,
  };

  return [userModel];
}

export default setUpModels;
