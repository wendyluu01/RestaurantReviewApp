import { Router } from 'express';
const router = Router();

import * as errors from '../helpers/error';
import { Admin } from '../services/Admin';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin API
 */

/**
 * @swagger
 *  paths:
 *    /admin:
 *      get:
 *        tags:
 *        - "Admin"
 *        summary: "Customize Header Menu"
 *        consumes:
 *          - application/json
 *        responses:
 *          200:
 *            description: "Result of Header Menu"
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
router.get('/', (req: any, res: any) => {
  const admin = new Admin();
  return admin
    .getMenuInfo(req.headers.authorization)
    .then((result) => {
      return res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /admin/menu:
 *      get:
 *        tags:
 *        - "Admin"
 *        summary: "Header Menu List"
 *        consumes:
 *          - application/json
 *        responses:
 *          200:
 *            description: "Result of Header Menu List"
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
router.get('/menu', (req: any, res: any) => {
  const admin = new Admin();
  return admin
    .getMenuList(req.headers.authorization)
    .then((result) => {
      return res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /admin/icons:
 *      get:
 *        tags:
 *        - "Admin"
 *        summary: "Header Icon List"
 *        consumes:
 *          - application/json
 *        responses:
 *          200:
 *            description: "Result of Header Icon List"
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
router.get('/icons', (req: any, res: any) => {
  const admin = new Admin();
  return admin
    .getIcons(req.headers.authorization)
    .then((result) => {
      return res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

/**
 * @swagger
 *  paths:
 *    /admin/{id}:
 *      delete:
 *        tags:
 *        - "Admin"
 *        summary: "Delete Header Menu"
 *        consumes:
 *          - application/json
 *        parameters:
 *        - in: path
 *          name: id
 *          description: "Menu ID"
 *          required: true
 *          schema:
 *            type: integer
 *        responses:
 *          200:
 *            description: "Result of Header Menu Delete"
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
router.delete('/:id', (req: any, res: any) => {
  const admin = new Admin();
  return admin
    .deleteMenu(req.headers.authorization, req.params.id)
    .then((result) => {
      return res.send(result);
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

module.exports = router;
