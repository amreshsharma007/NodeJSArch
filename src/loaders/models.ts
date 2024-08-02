import mongoose from 'mongoose';

function setUpModels(): {
  name: string;
  model: mongoose.Model<never>;
}[] {
  /**
   * WTF is going on here?
   *
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */

  const userModel = {
    name: 'userModel',
    // Notice the required syntax and the '.default'
    model: require('../models/user').default,
  };

  return [userModel];
}

export default setUpModels;
