require('dotenv').config();
export default {
  authSecret: '4mFr5Pv2G-;:D{A#',
  tokenExpireIn: process.env.NODE_ENV == 'development' ? '24h' : '30m',
  refreshTokenExpireIn: process.env.NODE_ENV == 'development' ? '750h' : '24h'
};
