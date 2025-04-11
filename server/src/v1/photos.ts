import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { Photo } from '../services/Photo';

const b64id = require('b64id');
/**
 * @swagger
 * tags:
 *   name: Photo
 *   description: Photo APIs
 */

/**
 * @swagger
 *  paths:
 *    /photo/list:
 *      get:
 *        tags:
 *        - "Photo"
 *        summary: "Photo List"
 *        consumes:
 *          - application/json
 *        description: "Get Photo List"
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
 *          name: photoId
 *          description: "Photo ID"
 *          schema:
 *            type: string
 *        responses:
 *          200:
 *            description: "Result of Photo List"
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
  const business = new Photo();
  const itemsPerPage = Math.min(req.query.items || 10, 100); // Limit to 100 items per page

  return business
    .getPhoto(
      req.headers.authorization,
      { page: req.query.page ?? 1, items: itemsPerPage },
      { sortDir: req.query.sortDir ?? 'ASC', sortBy: req.query.sortBy ?? 'id' },
      req.query.photoId
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
 *    /photo/business/{uuid}:
 *      get:
 *        tags:
 *        - "Photo"
 *        summary: "Photo List"
 *        consumes:
 *          - application/json
 *        description: "Get Photo List"
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
 *            description: "Result of Photo List"
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
  const business = new Photo();
  const itemsPerPage = Math.min(req.query.items || 10, 100); // Limit to 100 items per page

  return business
    .getPhotoByUUID(
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
