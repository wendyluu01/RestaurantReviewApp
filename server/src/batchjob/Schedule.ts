'use strict';

import { SbdcDashboard } from '../services/SBDC';
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

      templates.map(
        async (template: { id: number; url: string; gglSheet: any }) =>
          await this.saveGglSheet(template)
      );

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async saveGglSheet(template: { id: number; url: string; gglSheet: any }) {
    try {
      if (!template || !template.id || !template.url) {
        throw new Error('wrong template');
      }

      const answerExists = await db.survey_answers.findAll({
        raw: true,
        attributes: ['respondent', [Sequelize.literal('max("createdAt")'), 'created']],
        where: { templateId: template.id },
        order: [['respondent', 'ASC']],
        group: ['id'],
        subQuery: false,
        required: true
      });
      let lastSync = {};
      answerExists.forEach((re: { respondent: string; created: Date }) => {
        lastSync[re.respondent] = re.created;
      });

      const questions = await db.survey_questions.findAll({
        raw: true,
        attributes: ['key', 'examples'],
        where: { templateId: template.id }
      });

      request(
        {
          method: 'GET',
          url: template.url
        },
        async (err: any, response: any) => {
          let values: any = {};
          const res = JSON.parse(response.body);

          const q = res.values[0];
          let qArr = [];
          for (let i = 0; i < q.length; i++) {
            values = {
              index: Number(q[i].split('-')[0]) ? q[i].split('-')[0] : '',
              sub_1: Number(q[i].split('-')[1]) ? q[i].split('-')[1] : '',
              sub_2: Number(q[i].split('-')[2]) ? q[i].split('-')[2] : ''
            };
            qArr.push(values);
          }

          for (let i = 1; i < res.values.length; i++) {
            const value = res.values[i];
            const stringDate = value[0].split('.').join('').split(/ /);
            const stringDate2 =
              (stringDate[1].length == 1 ? '0' + stringDate[1] : stringDate[1]) +
              '-' +
              (stringDate[2].length == 1 ? '0' + stringDate[2] : stringDate[2]) +
              '-' +
              stringDate[0] +
              ' ' +
              stringDate[4] +
              (stringDate[3] == '오후' ? ' PM' : ' AM');
            const surveyTime = new Date(stringDate2);
            let respondentIdx = Number(template.gglSheet['respondent']);

            if (
              lastSync[value[respondentIdx]] === undefined ||
              lastSync[value[respondentIdx]] < surveyTime
            ) {
              let answerData: any[] = [];
              for (let i = 1; i < value.length; i++) {
                let answerValues = {
                  templateId: template.id,
                  version: 1,
                  index: Number(qArr[i]['index']) ?? '',
                  sub_1: Number(qArr[i]['sub_1']) ?? '',
                  sub_2: Number(qArr[i]['sub_2']) ?? '',
                  value: value[i],
                  respondent: value[respondentIdx],
                  createdAt: surveyTime,
                  updatedAt: new Date()
                };
                answerValues['key'] = `q${answerValues?.index}_${answerValues?.sub_1}${
                  answerValues?.sub_2 ? '_' + answerValues.sub_2 : ''
                }`;

                questions.map((q: { key: string; examples: any }) => {
                  if (q.key === answerValues['key']) {
                    answerValues['value'] =
                      q.examples.indexOf(value[i]) === -1
                        ? value[i]
                        : q.examples.indexOf(value[i]) + 1;
                  }
                });
                answerData.push(answerValues);
              }
              await db.survey_answers.bulkCreate(answerData);
              await db.survey_answeres_timestamps.update(
                { timestamp: new Date().toString() },
                {
                  where: { templateId: template.id },
                  returning: true
                }
              );
            }
          }
        }
      );

      return { success: 1 };
    } catch (e) {
      const errMail = new SbdcDashboard();
      let templateValues = {};

      templateValues['to'] = ['info@hjgrace.com'];
      templateValues['bcc'] = ['info@hjgrace.com'];
      templateValues['token'] = {
        error: e
      };
      templateValues['templateName'] = 'errorAlert';
      await errMail.sendEmailforErr(templateValues);
      throw new Error(e);
    }
  }
}

export { Scheduler };
