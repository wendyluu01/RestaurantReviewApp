// if the env path is incorrect on your local machine, the db will
// likely say the migration was correct but it might not be. double check
// that the migration has been a success! this env path is relative to
// the location of the built database files (root/db-build)
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '/api/.env.production' : '/api/.env'
});
const env = process.env;
module.exports = {
    development: {
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        host: env.DB_HOST,
        dialect: 'postgres',
        logging: false
        // use_env_variable: false
    },
    // development: {
    //   database: 'lright',
    //   username: 'lright',
    //   password: 'lrightdev',
    //   host: 'lright-dev.clmkwhkkqhl5.ap-northeast-2.rds.amazonaws.com',
    //   dialect: 'mysql',
    //   logging: false,
    //   // use_env_variable: false
    // },
    test: {
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        host: env.DB_TEST_HOST,
        dialect: 'postgres',
        logging: false
        // use_env_variable: false
    },
    production: {
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        host: env.DB_HOST,
        dialect: 'postgres',
        logging: false
        // use_env_variable: false
    },
    authSecret: '4mFr5Pv2G-;:D{A#',
    tokenExpireIn: '24h',
    refreshTokenExpireIn: '24h'
};
