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
      const dashboards = await db.dashboards
        .findAll({
          raw: true,
          attributes: ['id', 'value']
        })
        .then((result: any) => {
          let dashboardIds: number[] = [];
          result.map((re: { id: number; value: any }) => {
            if (re.value['batch'] === 'enable') {
              dashboardIds.push(re.id);
            }
          });
          return dashboardIds;
        })
        .catch((e: any) => {
          return e;
        });

      if (!dashboards.length) return;

      const templates = await db.survey_templates.findAll({
        raw: true,
        attributes: ['id', 'url', 'gglSheet'],
        where: {
          dashboardId: {
            [Op.in]: dashboards
          }
        }
      });

      if (!templates.length) {
        throw new Error('no templates');
      }

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
}

export { Scheduler };
