import db from '../db/models';
import { Token } from './Token';
const { Sequelize, Op } = require('sequelize');
import short from 'short-uuid';

/**
 * Admin APIs
 */
class Admin {
  constructor() {}

  async getMenuList(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const getMeneList = await db.header_menu.findAll({
        raw: true,
        attributes: [
          'id',
          'companyId',
          'name',
          'icon',
          'link',
          [Sequelize.col('company.name'), 'companyName']
        ],
        order: ['id'],
        include: [
          {
            model: db.company,
            required: true,
            attributes: [],
            as: 'company'
          }
        ]
      });

      return { success: 1, result: getMeneList };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getMenuInfo(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.companyManager && !currentUser.interviewer) {
        throw new Error('You do not have permission');
      }

      const getMenu = await db.menu_access.findAll({
        raw: true,
        attributes: [
          'menuId',
          [Sequelize.col('header_menu.name'), 'menuName'],
          [Sequelize.col('header_menu.icon'), 'icon'],
          [Sequelize.col('header_menu.link'), 'link']
        ],
        where: { companyId: currentUser.companyId[0] },
        order: ['menuId'],
        include: [
          {
            model: db.header_menu,
            required: true,
            attributes: [],
            as: 'header_menu'
          }
        ]
      });

      return { success: 1, result: getMenu };
    } catch (e) {
      throw new Error(e);
    }
  }

  async createMenu(
    authToken: string,
    data: {
      companyId: number;
      name: string;
      icon: number;
      link?: string;
    }
  ) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      if (!data.companyId) {
        throw new Error('no companyId');
      }

      let values = { ...data };
      const create = await db.header_menu.create(values);

      let menuValues: { companyId: number; menuId: number }[] = [];

      if (create.dataValues.id) {
        if (create.dataValues.companyId !== 2) {
          menuValues = [
            {
              companyId: 2,
              menuId: create.dataValues.id
            }
          ];
        }
        menuValues.push({ companyId: create.dataValues.companyId, menuId: create.dataValues.id });
      }

      const access = await db.menu_access.bulkCreate(menuValues);

      return { success: 1, result: create.get().id };
    } catch (e) {
      throw new Error(e);
    }
  }

  async updateMenu(
    authToken: string,
    data: {
      id: number;
      companyId: number;
      name: string;
      icon: number;
      link?: string;
    }
  ) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      if (!data.id || !data.companyId) {
        throw new Error('no id');
      }

      const existMenu = await db.header_menu.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id: data.id,
          companyId: data.companyId
        }
      });

      if (!existMenu?.id) {
        throw new Error('no menu');
      }

      let values = {
        ...data,
        updatedAt: new Date()
      };
      const update = await db.header_menu.update(values, {
        where: { id: existMenu.id }
      });

      return { success: 1, result: update[0] };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getIcons(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const getIcons = await db.icons.findAll({
        raw: true,
        attributes: ['id', 'icon']
      });
      return { success: 1, result: getIcons };
    } catch (e) {
      throw new Error(e);
    }
  }
  async deleteMenu(authToken: string, id: number) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const existMenu = await db.header_menu.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: id }
      });

      if (!existMenu?.id) {
        throw new Error('No Data found.');
      }
      await db.menu_access.destroy({
        where: { menuId: existMenu.id }
      });
      await db.header_menu.destroy({
        where: { id: existMenu.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async getProjectCategory(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const getCategory = await db.projects_category.findAll({
        raw: true,
        attributes: ['id', 'description'],
        order: ['id']
      });

      return { success: 1, result: getCategory };
    } catch (e) {
      throw new Error(e);
    }
  }
  async updateProjectCategory(
    authToken: string,
    data: {
      id: number;
      description: string;
    }
  ) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const exitstCategory = await db.projects_category.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: data.id }
      });

      if (exitstCategory?.id) {
        let values: { [key: string]: any } = {};
        values['description'] = data.description;
        values['updatedAt'] = new Date();

        await db.projects_category.update(values, {
          where: { id: exitstCategory.id }
        });

        return { success: 1 };
      } else {
        let values = {};
        values['description'] = data.description;
        const create = await db.projects_category.create(values);

        return { success: 1, result: create };
      }
    } catch (e) {
      throw new Error(e);
    }
  }
  async deleteProjectCategory(authToken: string, categoryId: number) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const exitstCategory = await db.projects_category.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: categoryId }
      });

      if (!exitstCategory?.id) {
        throw new Error('No Data found.');
      }

      await db.projects_category.destroy({
        where: { id: exitstCategory.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getProjectTeams(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin && !currentUser.companyManager) {
        throw new Error('You do not have permission');
      }

      const projectTeams = await db.projects_teams.findAll({
        raw: true,
        attributes: ['id', 'companyId', 'description', [Sequelize.col('company.name'), 'company']],
        where: {
          companyId: {
            [Op.in]: currentUser.companyId
          }
        },
        order: ['companyId'],
        include: [
          {
            model: db.company,
            required: true,
            attributes: [],
            as: 'company'
          }
        ]
      });

      return { success: 1, result: projectTeams };
    } catch (e) {
      throw new Error(e);
    }
  }
  async createProjectTeam(
    authToken: string,
    data: {
      companyId: number | null;
      description: string;
    }
  ) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin && !currentUser.companyManager) {
        throw new Error('You do not have permission');
      }

      let values = { ...data };

      if (data.companyId && currentUser.admin) {
        let filteredId = currentUser.companyId.filter((id: number) => id === data.companyId);
        values.companyId = filteredId;
      } else if (currentUser.companyId.length === 1) {
        values.companyId = currentUser.companyId[0];
      }

      await db.projects_teams.create(values);

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async updateProjectTeam(
    authToken: string,
    id: number,
    data: {
      companyId?: number;
      desciption: string;
    }
  ) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin && !currentUser.companyManager) {
        throw new Error('You do not have permission');
      }

      const teamExist = await db.projects_teams.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: id }
      });

      if (!id || !teamExist?.id) {
        throw new Error('Information does not exist.');
      }

      let values = {
        ...data,
        updatedAt: new Date()
      };

      if (data.companyId && currentUser.admin) {
        let filteredId = currentUser.companyId.filter((id: number) => id === data.companyId);
        values.companyId = filteredId;
      } else if (currentUser.companyId.length === 1) {
        values.companyId = currentUser.companyId[0];
      }

      await db.projects_teams.update(values, {
        where: { id: teamExist?.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async deleteProjectTeam(authToken: string, id: number) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin && !currentUser.companyManager) {
        throw new Error('You do not have permission');
      }

      const teamExist = await db.projects_teams.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: id }
      });

      if (!id || !teamExist?.id) {
        throw new Error('Information does not exist.');
      }

      await db.projects_teams.destroy({
        where: {
          id: teamExist?.id,
          companyId: {
            [Op.in]: currentUser.companyId
          }
        }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getDashboardList(authToken: string) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      const getDashboardList = await db.dashboards.findAll({
        raw: true,
        attributes: [
          'id',
          'companyId',
          'name',
          'link',
          'status',
          [Sequelize.col('company.name'), 'companyName']
        ],
        order: [
          ['status', 'DESC'],
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: db.company,
            required: true,
            attributes: [],
            as: 'company'
          }
        ]
      });

      if (currentUser.companyId.includes(2)) {
        return { success: 1, result: getDashboardList };
      }
      return {
        success: 1,
        result: getDashboardList.filter((dashboard: any) =>
          currentUser.companyId.includes(dashboard.companyId)
        )
      };
    } catch (e) {
      throw new Error(e);
    }
  }
  async createDashboard(authToken: string, data: any) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission to create.');
      }

      let values = {
        ...data,
        uuid: short.uuid()
      };
      const value = {
        batch: 'disable',
        googleForm: {
          url: '',
          formId: '',
          apiKey: '',
          sheet: '',
          total: 0,
          synced: 0,
          lastSynced: 0,
          params: {
            contact: '',
            name: '',
            shortUrl: ''
          }
        },
        tabs: [{ key: 'tab1', value: 'tab1' }],
        headerLabels: {
          tab1: { 
            header1: 'header1',
            note: 'Note/Remarks',
            isAnswered: 'Answered',
            update: '' 
          }
        },
        tableHeaders: {
          tab1: [
            'header1',
            'note',
            'isAnswered',
            'update'
          ]
        }
      };
      values['value'] = value;

      await db.dashboards.create(values);

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async updateDashboard(authToken: string, value: any) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission to update.');
      }

      const dashboardExist = await db.dashboards.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: value.id }
      });

      if (!value.id || !dashboardExist?.id) {
        throw new Error('Information does not exist.');
      }

      await db.dashboards.update(value, {
        where: { id: value.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
  async deleteDashboard(authToken: string, id: number) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const dashboardExist = await db.dashboards.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: id }
      });

      if (!id || !dashboardExist.id) {
        throw new Error('Information does not exist.');
      }

      await db.dashboards.destroy({
        where: { id: dashboardExist.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getSurveyTemplates(authToken: string, projectId: number) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission');
      }

      const getTemplates = await db.survey_templates.findAll({
        raw: true,
        attributes: ['id', 'uuid', 'version', 'name'],
        where: {
          projectId: projectId,
          status: [2, 3]
        }
      });

      return { success: 1, result: getTemplates };
    } catch (e) {
      throw new Error(e);
    }
  }

  async updateRespondantList(authToken: string, projectId: number, data: any) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission to update.');
      }

      const columns = Object.keys(db.survey_respondant.rawAttributes);

      const templateId = data.templateId;
      const values: Array<object> = data.values;

      values.forEach((value: any) => {
        const etc: any = {};

        for (let key in value) {
          if (!columns.includes(key)) {
            etc[key] = value[key];
            delete value[key];
          }
        }

        delete value.id;

        value.projectId = projectId;
        value.templateId = templateId;
        value.etc = etc;
        value.updatedAt = new Date();
      });

      let recordExists = await db.survey_respondant.findAll({
        raw: true,
        where: { projectId: projectId, templateId: templateId }
      });

      if (recordExists.length > 1) {
        values.forEach(async (value: any) => {
          let name = value.name;
          let index = recordExists.findIndex((r: any) => r.name === name);
          if (index !== -1) {
            await db.survey_respondant.update(value, {
              where: { projectId: projectId, templateId: templateId, name: name }
            });
            recordExists = recordExists.splice(index, 1);
          } else {
            await db.survey_respondant.create(value);
          }
        });

        recordExists.forEach(async (record: any) => {
          let name = record.name;
          let index = values.findIndex((v: any) => v.name === name);
          if (index == -1) {
            await db.survey_respondant.destroy({
              where: { projectId: projectId, templateId: templateId, name: name }
            });
          }
        });
      } else {
        await db.survey_respondant.bulkCreate(values);
      }

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }

  async updateRespondant(authToken: string, value: any) {
    try {
      const token = new Token(authToken);
      const currentUser = await token.getMyPermission();

      if (!currentUser.admin) {
        throw new Error('You do not have permission to update.');
      }

      const columns = Object.keys(db.survey_respondant.rawAttributes);

      const etc: any = {};
      const keys = Object.keys(value);
      for (let key of keys) {
        if (!columns.includes(key)) {
          etc[key] = value[key];
          delete value[key];
        }
      }

      value.etc = etc;
      value.updatedAt = new Date();

      await db.survey_respondant.update(value, {
        where: { id: value.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }

  async getRespondants(authToken: string, projectId: number, templateId: any) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission. Please contact the system hidden administrator.');
    }

    const data = await db.survey_respondant.findAll({
      raw: true,
      attributes: [
        'id',
        'name',
        'phone',
        'contactNum',
        'email',
        'company',
        'department',
        'position',
        'etc'
      ],
      where: {
        projectId: projectId,
        templateId: templateId
      },
      order: ['id']
    });

    return { success: 1, result: data };
  }

  async updateDashboardDetail(
    authToken: string,
    data: {
      id: number;
      value: any;
    }
  ) {
    if (!data.id) return;
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission');
    }

    try {
      const dashboardExist = await db.dashboards.findOne({
        raw: true,
        attributes: ['id'],
        where: { id: data.id }
      });

      if (!dashboardExist.id) {
        throw new Error('Dashboard does not exist.');
      }

      const newValues = { ...data.value };
      newValues['tableHeaders'] = {};
      newValues.tabs?.map((tab: { key: string; value: string }) => {
        newValues['tableHeaders'][tab.key] = Object.keys(newValues.headerLabels[tab.key]);
      });
      data.value = newValues;

      await db.dashboards.update(data, {
        where: { id: data.id }
      });

      return { success: 1 };
    } catch (e) {
      throw new Error(e);
    }
  }
}

export { Admin };
