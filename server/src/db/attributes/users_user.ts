import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  id: [[Seq.literal('DISTINCT ON ("users_user"."id") "users_user"."id"'), 'id']],
  uuid: [[Seq.literal('"users_user"."uuid"'), 'uuid']],
  first_name: [[Seq.literal('"users_user"."first_name"'), 'first_name']],
  last_name: [[Seq.literal('"users_user"."last_name"'), 'last_name']],
  email: [[Seq.literal('"users_user"."email"'), 'email']],
  phone: [[Seq.literal('"users_user"."phone"'), 'phone']]
};

export { attributes };
