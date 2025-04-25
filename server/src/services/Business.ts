import { col } from 'sequelize';
import db from '../db/models';
import { Token } from './Token';
// import { AWS } from './AWS';
// import { aws_access } from '/aws/aws_security';
const { Sequelize, Op } = require('sequelize');
const { MongoClient } = require('mongodb');

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

    // const whereClause: any = {};
    // if(Object.keys(filters).length === 0) {
    //   if (filters.name) whereClause.name = filters.name;
    //   if (filters.city) whereClause.city = filters.city;
    //   if (filters.state) whereClause.state = filters.state;
    //   if (filters.categories) whereClause.categories = { [Op.in]: filters.categories };
    // }

    return await db.business
    .findAll({
        raw: true,
        attributes: attr,
        where: Sequelize.where(
          Sequelize.cast(col('categories'), 'text[]'),
          { [Op.contains]: Sequelize.cast(['Restaurants'], 'text[]') }
        ),
        limit: pagination.items,
        offset: (pagination.page - 1) * pagination.items,
        order: [[sort.sortBy, sort.sortDir]]
      })
      .then((result: any) => {
        return result;
      });
  }

  async getSummaries(
    authToken: any,
    pagination: { page: number, items: number } = { page: 1, items: 25 },
    sort: { sortDir: string, sortBy: string } = { sortDir: 'DESC', sortBy: 'stars' },
    filters: string = "",
    stars: number = 0
  ) {
    const mongoUri = 'mongodb://admin:PassW0rd@apan-mongo:27017/';
    const client = new MongoClient(mongoUri);
    const dbName = 'reviewChew';

    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection('business');

      if (filters) {
        const whereClause: any = {};
        whereClause['stars'] = { $gte: parseFloat(stars.toString()) };
        if (filters) {
          const filterWords = filters.split(' ');
          const searchQueries = filterWords.map(word => ({ summary: { $regex: word, $options: 'i' } }));
          whereClause['$and'] = searchQueries;
        }
        const sortQuery: any = {};
        sortQuery[sort.sortBy] = sort.sortDir === 'DESC' ? -1 : 1;
        sortQuery['review_count'] = 'DESC';


        const businesses = await collection
          .find(whereClause)
          .sort(sortQuery)
          .limit(pagination.items)
          .toArray();

        return businesses;
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
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

  async getBusinessByUUID(authToken: any, uuid: string) {
    let attr = [];

    attr.push('uuid');
    attr.push('name');
    attr.push('address');
    attr.push('city');
    attr.push('state');
    attr.push('postal_code');
    attr.push('latitude');
    attr.push('longitude');
    attr.push('stars');
    attr.push('review_count');
    attr.push('attributes');
    attr.push('categories');
    attr.push('hours');

    let business = await db.business.findOne({
      raw: false,
      attributes: attr,
      where: { uuid: uuid },
      include: [
        {
          model: db.reviews,
          as: 'reviews',
          limit: 10,
          order: [['createdAt', 'DESC']],
          attributes: ['user_id', 'stars', 'text', 'useful', 'funny', 'cool', 'createdAt']
        },
        {
          model: db.photos,
          as: 'photos',
          limit: 20,
          order: [['id', 'DESC']],
          attributes: ['id', 'uuid', 'user_id', 'caption', 'label']
        }
      ]
    });

    if (!business) {
      return {};
    }

    const b64id = require('b64id');
    let photos = business.photos.map((photo: any) => ({
      ...photo.toJSON(),
      url: `https://s3.us-east-1.amazonaws.com/nsls.temp/photos/${b64id.uuidToB64(photo.uuid)}.jpg`
    }));

    // Convert createdAt from business.reviews to a string format mm/dd/yyyy
    let reviews = business.reviews = business.reviews.map((review: any) => {
      const date = new Date(review.createdAt);
      const options: any = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = date.toLocaleDateString('en-US', options);
      return {
        ...review.toJSON(),
        createdAt: formattedDate
      };
    });

    return {
      ...business.toJSON(),
      photos,
      reviews
    };
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

  async getStateList() {
    const states = await db.business.findAll({
      raw: true,
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('state')), 'state']],
    });

    return states.map((state: { state: string }) => state.state);
  }

  async getCityList(state: string) {
    try {
      const cities = await db.business.findAll({
        raw: true,
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']],
        where: { state: state },
        order: [[Sequelize.col('city'), 'ASC']],
      });

      return cities.map((city: { city: string }) => city.city);
    } catch (error) {
      console.error('Error fetching city list:', error);
      throw new Error('Failed to fetch city list');
    }
  }

  async getBusinessListInCity(state: string, city: string) {
    try {
      let attr = [];
      attr.push('uuid');
      attr.push('name');
      attr.push('latitude');
      attr.push('longitude');
      attr.push('address');
      attr.push('stars');
      attr.push('categories');
      attr.push('review_count');

      const restaurants = await db.business.findAll({
        raw: true,
        attributes: attr,
        where: {
          state: state,
          city: city,
          [Op.and]: Sequelize.where(
        Sequelize.cast(col('categories'), 'text[]'),
        { [Op.or]: [
            { [Op.contains]: Sequelize.cast(['Restaurants'], 'text[]') },
            { [Op.contains]: Sequelize.cast(['Dining'], 'text[]') }
          ]
        }
          )
        },
        order: [[Sequelize.col('name'), 'ASC']],
      });

      return restaurants;
    } catch (error) {
      console.error('Error fetching city list:', error);
      throw new Error('Failed to fetch city list');
    }
  }
  
}

export { Business };
