import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { User } from '../services/User';


/**
 * @swagger
 * tags:
 *   name: User
 *   description: USER APIs
 */

/**
 * @swagger
 *  paths:
 *    /user:
 *      post:
 *        tags:
 *        - "User"
 *        summary: "User List"
 *        consumes:
 *          - application/json
 *        description: "Get User List"
 *        parameters:
 *        - in: query
 *          name: page
 *          description: "Start page"
 *          schema:
 *            type: integer
 *        - in: query
 *          name: items
 *          description: "Number of items in a page"
 *          schema:
 *            type: integer
 *        - in: query
 *          name: sortDir
 *          description: "Sort direction"
 *          schema:
 *            type: string
 *        - in: query
 *          name: sortBy
 *          description: "Sort by"
 *          schema:
 *            type: string
 *        - in: body
 *          name: "body"
 *          description: "Input data"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              include:
 *                type: array
 *              filter:
 *                type: object
 *            example:
 *              include: [ "address", "age", "avatar", "salary", "gender", "company", "certifications", "handicap", "vulnerable", "skills", "militery", "mariage", "training", "work", "education", "computer_certification", "cosine", "computer", "careers"]
 *              filter: {
 *                "uuid" : "",
 *                "handicap" : 1,
 *                "handicap_weight" : 1,
 *                "vulnerable" : 1,
 *                "gender" : 1,
 *                "age" : 20,
 *                "education" : 3,
 *                "militery" : 1,
 *                "mariage" : 1,
 *                "location" : 1,
 *                "salary" : {"min":200, "max":300},
 *                "training" : 1,
 *                "favorite" : true,
 *                "computer_certification" : 1,
 *                "work" : 1
 *              }
 *        responses:
 *          200:
 *            description: "Result of User List"
 *            schema:
 *              type: object
 *              required:
 *                - success
 *                - result
 *              properties:
 *                success:
 *                  type: boolean
 *                result:
 *                  type: object
 */
router.post('/', (req: any, res: any) => {
  const user = new User();
  return user
    .getUsers(
      // get parameters by using request body.
      req.headers.authorization,
      req.body,
      { page: req.query.page, items: req.query.items },
      { sortDir: req.query.sortDir, sortBy: req.query.sortBy }
    )
    .then((result) => {
      return res.send({
        success: true,
        result: result
      });
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /user/myinfo:
 *      get:
 *        tags:
 *        - "User"
 *        summary: "Get My Info"
 *        consumes:
 *          - application/json
 *        description: "Get My Info"
 *        responses:
 *          200:
 *            description: "Result of My Info"
 *            schema:
 *              type: object
 *              required:
 *                - success
 *                - result
 *              properties:
 *                success:
 *                  type: boolean
 *                result:
 *                  type: object
 */
router.get('/myinfo', (req: any, res: any) => {
  const user = new User();

  try {
    return user
      .getMyInfo(req.headers.authorization)
      .then((result) => {
        return res.send(result);
      })
      .catch((err: any) => {
        return errors.errorHandler(res, err.message, null);
      });
  } catch (err) {
    return {
      success: 0,
      msg: err
    };
  }
});


/**
 * @swagger
 *  paths:
 *    /user/memberPermission/{uuid}:
 *      put:
 *        tags:
 *        - "User"
 *        summary: "Permission"
 *        consumes:
 *          - application/json
 *        description: "Permission"
 *        parameters:
 *        - in: path
 *          name: uuid
 *          description: "Update Permission"
 *          required: true
 *          schema:
 *            type: string
 *        - in: body
 *          name: "data"
 *          description: "Input data"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              role:
 *                type: array
 *            example:
 *              role: [5, 6, 7]
 *        responses:
 *          200:
 *            description: "Result of Permission"
 *            schema:
 *              type: object
 *              required:
 *                - success
 *                - result
 *              properties:
 *                success:
 *                  type: boolean
 *                result:
 *                  type: object
 */
router.put('/memberPermission/:uuid', (req: any, res: any) => {
  const user = new User();

  return user
    .updateMembersPermission(
      // get parameters by using request body.
      req.headers.authorization,
      req.params.uuid,
      req.body
    )
    .then((result) => {
      return res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

module.exports = router;
