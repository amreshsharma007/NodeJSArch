import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { OpticMiddleware } from '@useoptic/express-middleware';
import config from '@/config';
import setUpRoutes from '@/api';
import LoggerInstance from '@/loaders/logger';
import ApiResponse from '@/helpers/api-response';
import { isCelebrateError } from 'celebrate';
import apiResponseCodes from '@/config/apiResponseCodes';

function setUpExpress({ server }: { server: Application }): void {
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  server.get('/status', (req, res) => {
    const resp = new ApiResponse();
    resp.markSuccess();
    return res.status(res.statusCode).json(resp.createResponse());
    // return res.status(res.statusCode).json({});
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  server.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  server.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  server.use(require('method-override')());

  // Transforms the raw string of req.body into json
  server.use(express.json());

  // Load API routes
  server.use(config.api.prefix, setUpRoutes());

  // API Documentation
  server.use(
    OpticMiddleware({
      enabled: process.env.NODE_ENV !== 'production',
    }),
  );

  /// catch 404 and forward to error handler
  server.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.status && !req.httpStatusCode) {
      const err = new URIError(`404 Not Found: ${req.protocol}://${req.get('Host')}${req.url}`);
      // err['status'] = 404;
      // req.message = 'Url not found';
      // req.appCode = apiResponseCodes.urlNotFound;
      req.message = 'Error occurred';
      req.result = false;
      req.errors = ['Url not found'];
      req.httpStatusCode = apiResponseCodes.urlNotFound;
      next(err);
    }
  });

  /// error handlers
  server.use((err, req: Request, res: Response, next: NextFunction) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err) {
      LoggerInstance.error(err);

      const apiResponse = new ApiResponse();
      if (isCelebrateError(err)) {
        /**
         * Handle Joi Errors
         */
        // apiResponse.setMessage('Validation Error');
        apiResponse.setSuccess(false);
        // apiResponse.setAppCode(apiResponseCodes.validationFailed);
        apiResponse.setHttpCode(apiResponseCodes.validationFailed);

        /**
         * Copy error messages
         * to error section
         */
        if (err.details) {
          for (const errDetail of err.details.values()) {
            apiResponse.addError(errDetail.message);
          }
        }
      } else if (err.name === 'UnauthorizedError') {
        /**
         * Handle Unauthorized Error
         */
        apiResponse.setSuccess(false);

        apiResponse.setHttpCode(apiResponseCodes.unauthorized || req.httpStatusCode);

        /**
         * Copy error messages
         * to error section
         */
        if (err.details) {
          for (const errDetail of err.details) {
            apiResponse.addError(errDetail.message);
          }
        } else {
          apiResponse.setErrors(['Authorization Error']);
        }
      } else {
        // throw err;
        return next(err);
      }

      return res.status(apiResponse.getHttpCode()).send(apiResponse.createResponse()).end();
    }

    return next(err);
  });

  server.use((err, req: Request, res: Response, next: NextFunction) => {
    const apiResponse = new ApiResponse();
    // apiResponse.setAppCode(req.appCode || apiResponseCodes.serverError);
    // apiResponse.setMessage(req.message || err.message || 'No Message Found');
    apiResponse.setSuccess(false);
    apiResponse.setHttpCode(err.status || req.appCode || req.httpStatusCode || 500);

    /**
     * Modification by @Amresh
     *
     * Did these changes, because some of the icici's APIs
     * were throwing error even in positive scenario
     *
     * - Added one more condition req.errors.length > 0
     * - Added one more conditional value err.message || 'Server error. Please try again later'
     */
    req.errors =
      req.errors && req.errors.length > 0 ? req.errors : [err.message || 'Server error. Please try again later'];

    apiResponse.setErrors(req.errors);

    return res.status(apiResponse.getHttpCode()).send(apiResponse.createResponse());
  });
}

export default setUpExpress;
