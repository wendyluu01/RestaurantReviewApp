// Get dependencies
import express from 'express';
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

// if the env path is incorrect on your local machine, the db will
// likely say the migration was correct but it might not be. double check
// that the migration has been a success! this env path is relative to
// the location of the built database files (root/build/src/db)
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '/api/.env.production' : '/api/.env'
});

// Load environment variables
// require('dotenv').config();

// Base API URL.
const baseAPI = '/api/v1';
// Route handlers
// const authApi = require('./v1/auth');
// const userApi = require('./v1/user');
// const adminApi = require('./v1/admin');
const businessApi = require('./v1/business');
const photoApi = require('./v1/photos');
const reviewApi = require('./v1/review');


// Create server
const app: express.Application = express();

// Express configuration
app.set('port', process.env.API_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3100);
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileupload());
app.use(cookieParser());
app.use(cors());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Automated API docs
if (process.env.NODE_ENV == null || process.env.NODE_ENV != 'production') {
  const { swaggerUi, specs } = require('./modules/swagger');
  app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
// Error handler
app.use(errorHandler());

// API routes

// app.use(baseAPI + '/auth', authApi);
// app.use(baseAPI + '/user', userApi);
// app.use(baseAPI + '/admin', adminApi);
app.use(baseAPI + '/business', businessApi);
app.use(baseAPI + '/review', reviewApi);
app.use(baseAPI + '/photo', photoApi);

export { app };
