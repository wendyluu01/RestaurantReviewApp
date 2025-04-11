import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { Review } from '../services/Review';

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review APIs
 */

/**
 * @swagger
 *  paths:
 *    /review/list:
 *      get:
 *        tags:
 *        - "Review"
 *        summary: "Review List"
 *        consumes:
 *          - application/json
 *        description: "Get Review List"
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
 *            type: string
 *        responses:
 *          200:
 *            description: "Result of Review List"
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
  const business = new Review();
  const itemsPerPage = Math.min(req.query.items || 10, 100); // Limit to 100 items per page

  return business
    .getReview(
      req.headers.authorization,
      { page: req.query.page ?? 1, items: itemsPerPage },
      { sortDir: req.query.sortDir ?? 'ASC', sortBy: req.query.sortBy ?? 'id' },
      req.query.filter ?? ""
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
 *    /review/business/{uuid}:
 *      get:
 *        tags:
 *        - "Review"
 *        summary: "Review List"
 *        consumes:
 *          - application/json
 *        description: "Get Review List"
 *        parameters:
 *        - in: path
 *          name: uuid
 *          description: "Business UUID"
 *          required: true
 *          schema:
 *            type: string
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
 *        responses:
 *          200:
 *            description: "Result of Review List"
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
router.get('/business/:uuid', (req: any, res: any) => {
  const business = new Review();
  const itemsPerPage = Math.min(req.query.items || 10, 100); // Limit to 100 items per page

  return business
    .getReviewByUUID(
      req.headers.authorization,
      req.params.uuid,
      { page: req.query.page ?? 1, items: itemsPerPage },
      { sortDir: req.query.sortDir ?? 'ASC', sortBy: req.query.sortBy ?? 'id' }
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

module.exports = router;
