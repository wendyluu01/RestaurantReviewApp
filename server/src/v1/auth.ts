import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { Authentication } from '../services/Authentication';
// import { IUser } from '../types/user.types';
import { verifyToken } from '../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login and Register
 * definitions:
 *   Register:
 *     type: object
 *     required:
 *       - firstName
 *       - lastName
 *       - email
 *       - password
 *     properties:
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       firstName: developer
 *       lastName: test
 *       email: dev@test.com
 *       password: "123456"
 *   Login:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       email: dev@test.com
 *       password: "123456"
 *   Response_success:
 *     type: object
 *     required:
 *       - status
 *     properties:
 *       success:
 *         type: boolean
 *         description: response code
 *       message:
 *         type: string
 *         description: success message
 *     example:
 *       success: true
 *       message: "Thanks for registering! Please log in to continue."
 *   Response_error:
 *     type: object
 *     required:
 *       - status
 *     properties:
 *       success:
 *         type: boolean
 *         description: response code
 *       message:
 *         type: string
 *         description: error message
 *     example:
 *       success: false
 *       message: "error message."
 */

/**
 * @swagger
 *  paths:
 *    /auth/register:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Registration"
 *        consumes:
 *          - application/json
 *        description: "New User registration"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "value for member registration"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/Register"
 *        responses:
 *          200:
 *            description: "creation result"
 *            schema:
 *              $ref: "#/definitions/Response_success"
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/register', (req: any, res: any) => {
  const auth = new Authentication();

  auth
    .createUser(req.query, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    })
    .then((result) => {
      return res.send({
        success: true,
        message: result
      });
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/login:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Log In"
 *        consumes:
 *          - application/json
 *        description: "login"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "values for login"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/Login"
 *        responses:
 *          200:
 *            description: "success result"
 *            schema:
 *              type: object
 *              required:
 *                - firstName
 *                - lastName
 *                - email
 *                - password
 *              properties:
 *                success:
 *                  type: boolean
 *                authToken:
 *                  type: string
 *                refreshToken:
 *                  type: string
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *                email:
 *                  type: string
 *                company:
 *                  type: int
 *              example:
 *                success: true
 *                authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZjNiMjUxODYtZWJhOC00ZWE3LWI0NGEtMTkxZjAyZTM5MmI3IiwiaWF0IjoxNjM5MzU0Mjg4LCJleHAiOjE2MzkzNTQzNDh9.E6Mgs8c1-Rb8WGXySAuXHx1mW1gPfug0Gc2tDWPX1_s"
 *                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTYyOTA2MDI4NywiZXhwIjoxNjI5MDY3NDg3fQ.NODd9ApSAn2X_ctC5JYqdnW2-lHBIxq6AkgOp-37UD8"
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/login', (req: any, res: any) => {
  const authentication = new Authentication();

  return authentication
    .loginUser({
      email: req.body.email,
      password: req.body.password
    })
    .then((theUser: any) => {
      return (
        theUser &&
        res.send({
          success: true,
          authToken: theUser.authToken,
          refreshToken: theUser.refreshToken,
          id: theUser.id,
          name: theUser.name
        })
      );
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/validate:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Valitaion"
 *        consumes:
 *          - application/json
 *        description: "token"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "check token"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *            example:
 *              token: "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsImZpcnN0TmFtZSI6IuqwnOuwnCIsImxhc3ROYW1lIjoi6rmAIiwiZW1haWwiOiJkZXZAZW1haWwuY29tIiwicmVmcmVzaFRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDIxLTA4LTE1VDIwOjQ0OjEzLjQ5MVoiLCJ1cGRhdGVkQXQiOiIyMDIxLTA4LTE1VDIwOjQ0OjEzLjQ5MVoiLCJpYXQiOjE2MjkwNjAyODcsImV4cCI6MTYyOTA2MjA4N30.I5nNZo7oNo9wrCbYuK0QSzAx4wb7PztS5PHjOEJI_lM"
 *        responses:
 *          200:
 *            description: "success result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/validate', (req: any, res: any) => {
  const authentication = new Authentication();

  return authentication
    .validateToken(req.body.token)
    .then((result) => {
      res.send({
        success: result
      });
    })
    .catch((err: any) => {
      errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/refreshToken:
 *      get:
 *        tags:
 *        - "Auth"
 *        summary: "Valitaion"
 *        consumes:
 *          - application/json
 *        description: "Renew token"
 *        responses:
 *          200:
 *            description: "success result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: string
 *              example:
 *                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZjNiMjUxODYtZWJhOC00ZWE3LWI0NGEtMTkxZjAyZTM5MmI3IiwiaWF0IjoxNjM5MjcwMDUyLCJleHAiOjE2MzkyNzE4NTJ9.7xZtY2uQ_JFyoLy4H7au-_0VJeDTUsxZ87Q4wwoAWvk"
 */
router.get('/refreshToken', (req: any, res: any) => {
  const authentication = new Authentication();

  return authentication
    .refreshToken(req.headers.authorization)
    .then((result) => {
      res.send({
        token: result
      });
    })
    .catch((err: any) => {
      errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/isActivated:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Valitaion"
 *        consumes:
 *          - application/json
 *        description: "verification"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "check verification"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            example:
 *              email: "test@test.com"
 *        responses:
 *          200:
 *            description: "success result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/isActivated', (req: any, res: any) => {
  const authentication = new Authentication();
  return authentication
    .isActivated(req.body.email)
    .then((result) => {
      res.send(result);
    })
    .catch((err: string) => {
      res.send({
        success: false
      });
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/activate:
 *      put:
 *        tags:
 *        - "Auth"
 *        summary: "Valitaion"
 *        consumes:
 *          - application/json
 *        description: "activation"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "activation"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            example:
 *              email: "test@test.com"
 *        responses:
 *          200:
 *            description: "Success Result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.put('/activate', (req: any, res: any) => {
  const authentication = new Authentication();
  return authentication
    .activate(req.body.email)
    .then((result) => {
      res.send(result);
    })
    .catch((err: string) => {
      res.send({
        success: false
      });
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/sendActivationEmail:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Resend Activation Email"
 *        consumes:
 *          - application/json
 *        description: "Resend Activation Email"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "information for resend activation email"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            example:
 *              email: "test@test.com"
 *        responses:
 *          200:
 *            description: "Success Result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/sendActivationEmail', (req: any, res: any) => {
  const authentication = new Authentication();

  return res.send({
        success: false
      });
});

/**
 * @swagger
 *  paths:
 *    /auth/sendResetEmail:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Send Reset Email"
 *        consumes:
 *          - application/json
 *        description: "Send Reset Email for password"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "Information for reset email"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            example:
 *              email: "test@test.com"
 *        responses:
 *          200:
 *            description: "Success Result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/sendResetEmail', (req: any, res: any) => {
  const authentication = new Authentication();

  return true;
  // return authentication
  //   .sendResetEmail(req, req.body)
  //   .then((result) => {
  //     res.send(result);
  //   })
  //   .catch((err: any) => {
  //     return errors.errorHandler(res, err.message, null);
  //   });
});

/**
 * @swagger
 *  paths:
 *    /auth/resetPassword:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Reset Password"
 *        consumes:
 *          - application/json
 *        description: "Reset Password"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "Information for reset password"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              token:
 *                type: string
 *            example:
 *              email: "dev@test.com"
 *              password: "new password"
 *              token: "re"
 *        responses:
 *          200:
 *            description: "Success Result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/resetPassword', (req: any, res: any) => {
  const authentication = new Authentication();

  return authentication
    .resetPassword(req.body)
    .then((result) => {
      res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /auth/invitation:
 *      post:
 *        tags:
 *        - "Auth"
 *        summary: "Invitation"
 *        consumes:
 *          - application/json
 *        description: "Invitation friend"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "Email for invitation"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              companyUuid:
 *                type: string
 *        responses:
 *          200:
 *            description: "Success Result"
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *              example:
 *                success: true
 *          400:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 *          404:
 *            description: "Wrong data error"
 *            schema:
 *              $ref: "#/definitions/Response_error"
 */
router.post('/invitation', (req: any, res: any) => {
  const authentication = new Authentication();

  return true;
  // return authentication
  //   .invitation(req.headers.authorization, req.body)
  //   .then((result) => {
  //     res.send(result);
  //   })
  //   .catch((err: any) => {
  //     return errors.errorHandler(res, err.message, null);
  //   });
});

router.use(verifyToken());

router.post('/protected', (req: any, res: any) => {
  res.send({
    success: true
  });
});

module.exports = router;
