# NodeJSArch - A Best Node.js architecture 🛡️

The API by itself doesn't do anything fancy, it's just a user CRUD with authentication capabilities.
Maybe we can transform this into something useful, a more advanced example, just open an issue and let's discuss the future of the repo.

## Development

We use `node` version `20.15.0`

```
nvm install 20.15.0
```

```
nvm use 20.15.0
```

The first time, you will need to run

```
npm install
```

Then just start the server with

```
npm run start
```
It uses nodemon for live reloading :peace-fingers:

# API Validation

 By using [celebrate](https://github.com/arb/celebrate), the req.body schema becomes clearly defined at route level, so even frontend devs can read what an API endpoint expects without needing to write documentation that can get outdated quickly.

 ```js
 route.post('/signup',
  celebrate({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  controller.signup)
 ```

 **Example error**

 ```json
 {
  "errors": {
    "default": "Error occurred",
    "name": "Required field",
    "email": "child \"email\" fails because [\"email\" is required]"
  }
}
 ```

[Read more about celebrate here](https://github.com/arb/celebrate) and [the Joi validation API](https://github.com/hapijs/joi/blob/v15.0.1/API.md)

# Roadmap
- [x] API Validation layer (Celebrate+Joi)
- [ ] Unit tests examples
- [x] [Cluster mode](https://softwareontheroad.com/nodejs-scalability-issues?utm_source=github&utm_medium=readme)
- [x] The logging _'layer'_
- [ ] Add agenda dashboard
- [x] Continuous integration with CircleCI 😍
- [ ] Deploys script and docs for AWS Elastic Beanstalk and Heroku
- [ ] Integration test with newman 😉
- [ ] Instructions on typescript debugging with VSCode

## API Documentation

To simplify documenting your API, we have included [Optic](https://useoptic.com). To use it, you will need to [install the CLI tool](https://useoptic.com/document/#add-an-optic-specification-to-your-api-project), and then you can use `api exec "npm start"` to start capturing your endpoints as you create them. Once you want to review and add them to your API specification run: `api status -- review`.

# FAQ

 ## Where should I put the FrontEnd code? Is this a good backend for Angular or React or Vue or _whatever_ ?

  [It's not a good idea to have node.js serving static assets a.k.a the frontend](https://softwareontheroad.com/nodejs-scalability-issues?utm_source=github&utm_medium=readme)

  Also, I don't want to take part in frontend frameworks wars 😅

  Just use the frontend framework you like the most _or hate the least_. It will work 😁

 ## Don't you think you can add X layer to do Y? Why do you still use express if the Serverless Framework is better and it's more reliable?

  I know this is not a perfect architecture, but it's the most scalable that I know with less code and headache that I know.

  It's meant for small startups or one-developer army projects.

  I know if you start moving layers into another technology, you will end up with your business/domain logic into npm packages, your routing layer will be pure AWS Lambda functions and your data layer a combination of DynamoDB, Redis, maybe redshift, and Agolia.

  Take a deep breath and go slowly, let the business grow and then scale up your product. You will need a team and talented developers anyway.
