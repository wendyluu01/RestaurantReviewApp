import { Response } from 'express';

export const errorHandler = (res: Response, errorMessage: string, errorCode: string | null) => {
  if (errorCode === 'invalidToken' || errorCode === 'refreshExpired') {
    return res.status(403).send({
      success: false,
      message: errorMessage,
      code: errorCode
    });
  } else if (errorCode === 'notFound') {
    return res
      .status(404)
      .send(
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Error</title></head><body><pre>' +
          errorMessage +
          '</pre></body></html>'
      );
  } else {
    return res.status(400).send({
      success: false,
      message: errorMessage
    });
  }
};
