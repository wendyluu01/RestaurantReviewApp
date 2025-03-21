import { col } from 'sequelize';
import db from '../db/models';
import { Token } from './Token';
// import { AWS } from './AWS';
// import { aws_access } from '/aws/aws_security';
const { Sequelize, Op } = require('sequelize');

/**
 * Review APIs
 */
class Review {
  constructor() {}

  async getReview(
    authToken: any,
    pagination: { page: number, items: number } = { page: 1, items: 25 },
    sort: { sortDir: string, sortBy: string } = { sortDir: 'DESC', sortBy: 'id' },
    filters: string = ""
  ) {
    // const token = new Token(authToken);
    // const uuid = await token.getUuid();

    const { attributes } = require('../db/attributes/reviews');
    let attr = [],
      scope = [];
    attr.push(...attributes['default']);

    const whereClause: any = {};
    
    // filters is many words separated by space
    if (filters) {
      const filterWords = filters.split(' ');
      whereClause[Op.and] = filterWords.map((word: string) => ({
      text: { [Op.iLike]: `%${word}%` }
      }));
    }
    return await db.reviews
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

  async getReviewByUUID(review: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(reviews.id)'), 'ids']);
    } else if (only === 'text') {
      attr.push([Sequelize.literal('array_agg(reviews.text)'), 'texts']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('stars');
      attr.push('text');
      attr.push('useful');
      attr.push('funny');
      attr.push('cool');
    }

    return (await db.reviews.findAll({
      raw: true,
      attributes: attr,
      where: { uuid: { [Op.in]: review } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      stars: number;
      text: string;
      useful: number;
      funny: number;
      cool: number;
      texts?: Array<string>;
    }>;
  }

  async getReviewByID(review: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(reviews.id)'), 'ids']);
    } else if (only === 'text') {
      attr.push([Sequelize.literal('array_agg(reviews.text)'), 'texts']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('stars');
      attr.push('text');
      attr.push('useful');
      attr.push('funny');
      attr.push('cool');
    }

    return (await db.reviews.findAll({
      raw: true,
      attributes: attr,
      where: { id: { [Op.in]: review } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      stars: number;
      text: string;
      useful: number;
      funny: number;
      cool: number;
      ids?: Array<number>;
      texts?: Array<string>;
    }>;
  }
}

export { Review };
