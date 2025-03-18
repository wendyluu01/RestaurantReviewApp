exports.up = (pgm) => {
  pgm.createTable('users', {
    user_id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    review_count: { type: 'integer', default: 0 },
    yelping_since: { type: 'timestamp', notNull: true },
    friends: { type: 'text[]' },
    useful: { type: 'integer', default: 0 },
    funny: { type: 'integer', default: 0 },
    cool: { type: 'integer', default: 0 },
    fans: { type: 'integer', default: 0 },
    elite: { type: 'text[]' },
    average_stars: { type: 'numeric', default: 0 },
    compliment_hot: { type: 'integer', default: 0 },
    compliment_more: { type: 'integer', default: 0 },
    compliment_profile: { type: 'integer', default: 0 },
    compliment_cute: { type: 'integer', default: 0 },
    compliment_list: { type: 'integer', default: 0 },
    compliment_note: { type: 'integer', default: 0 },
    compliment_plain: { type: 'integer', default: 0 },
    compliment_cool: { type: 'integer', default: 0 },
    compliment_funny: { type: 'integer', default: 0 },
    compliment_writer: { type: 'integer', default: 0 },
    compliment_photos: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  }, { ifNotExists: true });

  pgm.createTable('businesses', {
    business_id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'varchar(255)', notNull: true },
    city: { type: 'varchar(255)', notNull: true },
    state: { type: 'varchar(255)', notNull: true },
    postal_code: { type: 'varchar(20)', notNull: true },
    latitude: { type: 'numeric', notNull: true },
    longitude: { type: 'numeric', notNull: true },
    stars: { type: 'numeric', notNull: true },
    review_count: { type: 'integer', notNull: true },
    is_open: { type: 'boolean', notNull: true },
    attributes: { type: 'jsonb' },
    categories: { type: 'varchar(255)', notNull: true },
    hours: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  }, { ifNotExists: true });

  pgm.createTable('reviews', {
    review_id: { type: 'varchar(255)', primaryKey: true },
    user_id: { type: 'varchar(255)', notNull: true, references: 'users(user_id)', onDelete: 'CASCADE' },
    business_id: { type: 'varchar(255)', notNull: true, references: 'businesses(business_id)', onDelete: 'CASCADE' },
    stars: { type: 'integer', notNull: true },
    useful: { type: 'integer', default: 0 },
    funny: { type: 'integer', default: 0 },
    cool: { type: 'integer', default: 0 },
    text: { type: 'text', notNull: true },
    date: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  }, { ifNotExists: true });

  pgm.createTable('tips', {
    user_id: { type: 'varchar(255)', notNull: true, references: 'users(user_id)', onDelete: 'CASCADE' },
    business_id: { type: 'varchar(255)', notNull: true, references: 'businesses(business_id)', onDelete: 'CASCADE' },
    text: { type: 'text', notNull: true },
    date: { type: 'timestamp', notNull: true },
    compliment_count: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  }, { ifNotExists: true });

  pgm.createTable('checkins', {
    business_id: { type: 'varchar(255)', notNull: true, references: 'businesses(business_id)', onDelete: 'CASCADE' },
    date: { type: 'timestamp[]', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  }, { ifNotExists: true });

  pgm.createTable('api_keys', {
    api_key: { type: 'varchar(255)', primaryKey: true },
    user_id: { type: 'varchar(255)', notNull: true, references: 'users(user_id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    expires_at: { type: 'timestamp', notNull: true }
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('api_keys');
  pgm.dropTable('checkins');
  pgm.dropTable('tips');
  pgm.dropTable('reviews');
  pgm.dropTable('businesses');
  pgm.dropTable('users');
};
