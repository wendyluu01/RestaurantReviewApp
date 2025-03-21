const jwt = require('jsonwebtoken');
import * as express from 'express';
const config = require('../db/config/secret');
import * as errors from '../helpers/error';

const verifyToken = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let token = req.headers.authorization;
    token = token && token.replace(/^bearer /i, '');
    return jwt.verify(token, config.default.authSecret, (jwtErr: any, decoded: any) => {
      if (jwtErr) {
        return errors.errorHandler(res, JSON.stringify(req.headers), null);
      } else {
        req.thisUser = decoded;
        return next();
      }
    });
  };
};

export { verifyToken };
