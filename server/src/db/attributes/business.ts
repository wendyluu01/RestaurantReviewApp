import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  id: [[Seq.literal('DISTINCT ON ("business"."id") "business"."id"'), 'id']],
  // uuid: [[Seq.col('business.uuid'), 'uuid']],
  // name: [[Seq.col('business.name'), 'name']],
  // address: [[Seq.col('business.address'), 'address']],
  // city: [[Seq.col('business.city'), 'city']],
  // state: [[Seq.col('business.state'), 'state']],
  // postal_code: [[Seq.col('business.postal_code'), 'postal_code']],
  // latitude: [[Seq.col('business.latitude'), 'latitude']],
  // longitude: [[Seq.col('business.longitude'), 'longitude']],
  // stars: [[Seq.col('business.stars'), 'stars']],
  // review_count: [[Seq.col('business.review_count'), 'review_count']],
  // is_open: [[Seq.col('business.is_open'), 'is_open']],
  // attributes: [[Seq.col('business.attributes'), 'attributes']],
  // categories: [[Seq.col('business.categories'), 'categories']],
  // hours: [[Seq.col('business.hours'), 'hours']],
  default: [
    'id',
    'uuid',
    'name',
    'address',
    'city',
    'state',
    'postal_code',
    'latitude',
    'longitude',
    'stars',
    'review_count',
    'is_open',
    'attributes',
    'categories',
    'hours'
  ],
};

export { attributes };
