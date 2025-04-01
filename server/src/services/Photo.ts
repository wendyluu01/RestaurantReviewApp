import { col } from 'sequelize';
import db from '../db/models';
import { Token } from './Token';
// import { AWS } from './AWS';
// import { aws_access } from '/aws/aws_security';
const { Sequelize, Op } = require('sequelize');

/**
 * Photo APIs
 */
class Photo {
  constructor() {}

  async getPhoto(
    authToken: any,
    pagination: any = { page: 1, items: 25 },
    sort: any = { sortDir: 'DESC', sortBy: 'id' },
    photoId: string
  ) {
    // const token = new Token(authToken);
    // const uuid = await token.getUuid();
    const b64id = require('b64id');
    const { attributes } = require('../db/attributes/photos');
    let attr = [],
      scope = [];
      attr.push(...attributes['default']);
      console.log('photoId ', photoId);

    const whereClause: any = {};
    if (photoId != "" && photoId != null && photoId != undefined) {
      whereClause.uuid = b64id.b64ToUuid(photoId);
    }

    console.log('whereClause', whereClause);
    return await db.photos
    .findAll({
        raw: true,
        attributes: attr,
        where: whereClause,
        limit: pagination.items,
        offset: (pagination.page - 1) * pagination.items,
        order: [[sort.sortBy, sort.sortDir]]
      })
      .then((result: any) => {

        // convert uuid to b64
        result.map((photo: any) => {
          photo.uuid = b64id.uuidToB64(photo.uuid);
          photo.url = 'https://s3.us-east-1.amazonaws.com/nsls.temp/photos/'+photo.uuid+'.jpg';
        });
        return result;
      });
  }

  // Change with JWT token Auth.
  async getComapny(userId: any) {
    return db.user_company
      .findOne({
        raw: true,
        where: { userId: userId }
      })
      .then((result: any) => {
        if (result != null) {
          return result['id'];
        } else {
          return 0;
        }
      });
  }

  async getPermissions(uuid: any) {
    const { attributes } = require('../db/attributes/users');

    return await db.business
      .scope(['permission', 'company'])
      .findAll({
        raw: true,
        attributes: [...attributes['permission']],
        where: { uuid },
        group: ['business.id', 'company.id', 'company->hq.uuid']
      })
      .then((result: any) => {
        return result[0];
      });
  }

  async getPhotoByUUID(business: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(business.id)'), 'ids']);
    } else if (only === 'email') {
      attr.push([Sequelize.literal('array_agg(business.email)'), 'emails']);
    } else if (only === 'name') {
      attr.push([Sequelize.literal('array_agg(concat(business.lastname, business.lastname))'), 'names']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('email');
      attr.push('firstName');
      attr.push('lastName');
    }

    return (await db.business.findAll({
      raw: true,
      attributes: attr,
      where: { uuid: { [Op.in]: business } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      email: string;
      firstName: string;
      lastName: string;
      ids?: Array<number>;
      emails?: Array<string>;
    }>;
  }

  async getPhotoByID(business: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(business.id)'), 'ids']);
    } else if (only === 'email') {
      attr.push([Sequelize.literal('array_agg(business.email)'), 'emails']);
    } else if (only === 'name') {
      attr.push([Sequelize.literal('array_agg(concat(business.lastname, business.lastname))'), 'names']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('email');
      attr.push('firstName');
      attr.push('lastName');
    }

    return (await db.business.findAll({
      raw: true,
      attributes: attr,
      where: { id: { [Op.in]: business } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      email: string;
      firstName: string;
      lastName: string;
      ids?: Array<number>;
      emails?: Array<string>;
    }>;
  }
}

export { Photo };
