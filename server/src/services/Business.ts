import { col } from 'sequelize';
import db from '../db/models';
import { Token } from './Token';
// import { AWS } from './AWS';
// import { aws_access } from '/aws/aws_security';
const { Sequelize, Op } = require('sequelize');

/**
 * Business APIs
 */
class Business {
  constructor() {}

  async getBusiness(
    authToken: any,
    pagination: { page: number, items: number } = { page: 1, items: 25 },
    sort: { sortDir: string, sortBy: string } = { sortDir: 'DESC', sortBy: 'id' },
    filters: any = {}
  ) {
    // const token = new Token(authToken);
    // const uuid = await token.getUuid();

    const { attributes } = require('../db/attributes/business');
    let attr = [],
      scope = [];
      attr.push(...attributes['default']);

    const whereClause: any = {};
    if(Object.keys(filters).length === 0) {
      if (filters.name) whereClause.name = filters.name;
      if (filters.city) whereClause.city = filters.city;
      if (filters.state) whereClause.state = filters.state;
      if (filters.categories) whereClause.categories = { [Op.contains]: filters.categories };
    }

    return await db.business
    .findAll({
        raw: true,
        attributes: attr,
        where: whereClause,
        limit: pagination.items,
        offset: (pagination.page - 1) * pagination.items,
        order: [[sort.sortBy, sort.sortDir]]
      })
      .then((result: any) => {
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

  async getBusinessByUUID(business: any, only = '') {
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

  async getBusinessByID(business: any, only = '') {
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

export { Business };
