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
  const itemsPerPage = Math.min(req.query.items || 10, 100); // Limit to 100 items per page

  return business
    .getBusiness(
      req.headers.authorization,
      { page: req.query.page ?? 1, items: itemsPerPage },
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

// // Function to get businesses with reviews
// router.get('/business/reviews', (req: any, res: any) => {
//   const business = new Business();

//   return business
//     .getBusinessesWithReviews(
//       req.headers.authorization,
//       { page: req.query.page, items: req.query.items },
//       { sortDir: req.query.sortDir, sortBy: req.query.sortBy },
//       req.query.filter
//     )
//     .then((result) => {
//       return res.send({
//         success: true,
//         result: result
//       });
//     })
//     .catch((err: any) => {
//       return errors.errorHandler(res, err.message, null);
//     });
// });

// // Function to get businesses with photos
// router.get('/business/photos', (req: any, res: any) => {
//   const business = new Business();

//   return business
//     .getBusinessesWithPhotos(
//       req.headers.authorization,
//       { page: req.query.page, items: req.query.items },
//       { sortDir: req.query.sortDir, sortBy: req.query.sortBy },
//       req.query.filter
//     )
//     .then((result) => {
//       return res.send({
//         success: true,
//         result: result
//       });
//     })
//     .catch((err: any) => {
//       return errors.errorHandler(res, err.message, null);
//     });
// });

module.exports = router;
