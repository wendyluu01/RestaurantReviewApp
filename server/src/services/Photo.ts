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
    
    // THIS AUTHORIZATION IS NOT IMPLEMENTED YET
    // const token = new Token(authToken);
    // const currentUser = await token.getMyPermission();
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

  async getPhotoByUUID( authToken: any,
    uuid: string,
    pagination: { page: number, items: number } = { page: 1, items: 25 },
    sort: { sortDir: string, sortBy: string } = { sortDir: 'DESC', sortBy: 'stars' }) {

    // THIS AUTHORIZATION IS NOT IMPLEMENTED YET
    // const token = new Token(authToken);
    // const currentUser = await token.getMyPermission();

    let attr = [];

    attr.push('uuid');
    attr.push('business_id');
    attr.push('caption');
    attr.push('label');
    
    // Get busines id from buisiness by uuid
    const b64id = require('b64id');
    const business = await db.business.findOne({
      raw: true,
      attributes: ['id'],
      where: { uuid: uuid }
    });
    if (business === null) {
      return [];
    }

    const businessId = business.id;

    const result = await db.photos.findAll({
      raw: true,
      attributes: attr,
      where: { business_id: businessId },
      limit: pagination.items,
      offset: (pagination.page - 1) * pagination.items,
      order: [[sort.sortBy, sort.sortDir]]
    });

    if (result === null) {
      return [];
    }
    return result.map((photo: any) => {
        photo.url = 'https://s3.us-east-1.amazonaws.com/nsls.temp/photos/'+b64id.uuidToB64(photo.uuid)+'.jpg';
        return photo;
      }
    );
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
