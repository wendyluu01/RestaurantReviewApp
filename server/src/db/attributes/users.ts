import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  id: [[Seq.literal('DISTINCT ON ("users_user"."id") "users_user"."id"'), 'id']],
  uuid: [[Seq.literal('DISTINCT ON ("users_user"."id") "users_user"."uuid"'), 'uuid']]
};

export { attributes };
