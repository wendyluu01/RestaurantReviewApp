import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  id: [[Seq.literal('"photos"."id"'), 'id']],
  default: [
    'id',
    'uuid',
    'review_id',
    'user_id',
    'business_id',
    'caption',
    'label',
  ],
};

export { attributes };
