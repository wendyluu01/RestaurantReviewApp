'use strict';

import db from '../db/models';
const { Sequelize, Op } = require('sequelize');
const request = require('request');

/**
 * User APIs
 */
class Scheduler {
  constructor() {}

  async getBatchInfo() {
    try {
      return { 
        success: 1,
        message: 'Batch job run ' + new Date().toISOString(),
      };
    } catch (e) {
      throw new Error(e);
    }
  }
}

export { Scheduler };
