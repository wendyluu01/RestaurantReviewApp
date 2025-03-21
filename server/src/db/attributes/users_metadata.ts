import db from '../models';

const Seq = db.Sequelize;

const attributes = {
  user_id: [[Seq.col('users_metadata.user_id'), 'user_id']],
  review_count: [[Seq.col('users_metadata.review_count'), 'review_count']],
  yelping_since: [[Seq.col('users_metadata.yelping_since'), 'yelping_since']],
  useful: [[Seq.col('users_metadata.useful'), 'useful']],
  funny: [[Seq.col('users_metadata.funny'), 'funny']],
  cool: [[Seq.col('users_metadata.cool'), 'cool']],
  fans: [[Seq.col('users_metadata.fans'), 'fans']],
  elite: [[Seq.col('users_metadata.elite'), 'elite']],
  average_stars: [[Seq.col('users_metadata.average_stars'), 'average_stars']],
  compliment_hot: [[Seq.col('users_metadata.compliment_hot'), 'compliment_hot']],
  compliment_more: [[Seq.col('users_metadata.compliment_more'), 'compliment_more']],
  compliment_profile: [[Seq.col('users_metadata.compliment_profile'), 'compliment_profile']],
  compliment_cute: [[Seq.col('users_metadata.compliment_cute'), 'compliment_cute']],
  compliment_list: [[Seq.col('users_metadata.compliment_list'), 'compliment_list']],
  compliment_note: [[Seq.col('users_metadata.compliment_note'), 'compliment_note']],
  compliment_plain: [[Seq.col('users_metadata.compliment_plain'), 'compliment_plain']],
  compliment_cool: [[Seq.col('users_metadata.compliment_cool'), 'compliment_cool']],
  compliment_funny: [[Seq.col('users_metadata.compliment_funny'), 'compliment_funny']],
  compliment_writer: [[Seq.col('users_metadata.compliment_writer'), 'compliment_writer']],
  compliment_photos: [[Seq.col('users_metadata.compliment_photos'), 'compliment_photos']]
};

export { attributes };
