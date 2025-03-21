import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  id: [[Seq.literal('DISTINCT ON ("reviews"."id") "reviews"."id"'), 'id']],
  default: [
    'id',
    'uuid',
    'stars',
    'text',
    'useful',
    'funny',
    'cool'
  ]
};

export { attributes };
