import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { Business } from '../services/Business';

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Business APIs
 */

/**
 * @swagger
 *  paths:
 *    /business/list:
 *      get:
 *        tags:
 *        - "Business"
 *        summary: "Business List"
 *        consumes:
 *          - application/json
 *        description: "Get Business List"
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
 *        - in: query
 *          name: filter
 *          description: "Filter criteria"
 *          schema:
 *            type: object
 *        responses:
 *          200:
 *            description: "Result of Business List"
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
router.get('/list', (req: any, res: any) => {
  const business = new Business();

  return business
    .getBusiness(
      req.headers.authorization,
      { page: req.query.page ?? 1, items: req.query.items ?? 25 },
      { sortDir: req.query.sortDir ?? 'ASC', sortBy: req.query.sortBy ?? 'id' },
      req.query.filter != "" && req.query.filter != undefined ? JSON.parse(req.query.filter) : {}
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
 *    /business/getList:
 *      get:
 *        tags:
 *        - "Business"
 *        summary: "Business Summary List"
 *        consumes:
 *          - application/json
 *        description: "Get Business List"
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
 *        - in: query
 *          name: filter
 *          description: "Search Keywords"
 *          schema:
 *            type: string
 *        - in: query
 *          name: stars
 *          description: "Rating Score above"
 *          schema:
 *            type: integer
 *        responses:
 *          200:
 *            description: "Result of Business List"
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
router.get('/getList', (req: any, res: any) => {
  const business = new Business();
  const itemsPerPage = Math.min(req.query.items || 10, 2000); // Limit to 100 items per page

  return business
    .getSummaries(
      req.headers.authorization,
      { page: req.query.page ?? 1, items: itemsPerPage },
      { sortDir: req.query.sortDir ?? 'DESC', sortBy: req.query.sortBy ?? 'review_counts' },
      req.query.filter ?? "",
      req.query.stars ?? 0
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
 *    /business/getDetail/{uuid}:
 *      get:
 *        tags:
 *        - "Business"
 *        summary: "Business Detail Information"
 *        consumes:
 *          - application/json
 *        description: "Get Business List"
 *        parameters:
 *        - in: path
 *          name: uuid
 *          description: "Business UUID"
 *          required: true
 *          schema:
 *            type: string
 *        responses:
 *          200:
 *            description: "Result of Business Detail Information"
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
router.get('/getDetail/:uuid', (req: any, res: any) => {
  const business = new Business();

  return business
    .getBusinessByUUID(
      req.headers.authorization,
      req.params.uuid
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
 *    /business/getStateList:
 *      get:
 *        tags:
 *        - "Business"
 *        summary: "State List"
 *        consumes:
 *          - application/json
 *        description: "Get State List"
 *        responses:
 *          200:
 *            description: "Result of State List"
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
router.get('/getStateList', (req: any, res: any) => {
  const business = new Business();

  return business
    .getStateList()
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
 *    /business/getCityList/{state}:
 *      get:
 *        tags:
 *        - "Business"
 *        summary: "City List"
 *        consumes:
 *          - application/json
 *        description: "Get City List"
 *        parameters:
 *        - in: path
 *          name: state
 *          description: "State Name"
 *          required: true
 *          schema:
 *            type: string
 *        responses:
 *          200:
 *            description: "Result of City List"
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
router.get('/getCityList/:state', (req: any, res: any) => {
  const business = new Business();

  return business
    .getCityList(req.params.state)
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
 *    /business/getBusinessListInCity:
 *      post:
 *        tags:
 *        - "Business"
 *        summary: "Business List"
 *        consumes:
 *          - application/json
 *        description: "Get Business List in specific city"
 *        parameters:
 *        - in: body
 *          name: "body"
 *          description: "State and City"
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              state:
 *                type: string
 *              city:
 *                type: string
 *            example:
 *              state: "NJ"
 *              city: "Beverly"
 *        responses:
 *          200:
 *            description: "Result of Business List in the City"
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
router.post('/getBusinessListInCity', (req: any, res: any) => {
  const business = new Business();

  return business
    .getBusinessListInCity(req.body.state, req.body.city)
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


module.exports = router;
