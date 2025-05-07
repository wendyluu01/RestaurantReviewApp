import db from '../db/models';
import { Token } from './Token';
// import { AWS } from './AWS';
// import { aws_access } from '/aws/aws_security';
const { Sequelize, Op } = require('sequelize');

/**
 * User APIs
 */
class User {
  constructor() {}

  async getUsers(
    authToken: any,
    params: any,
    pagination: any = { page: 1, items: 25 },
    sort: any = { sortDir: 'ASC', sortBy: 'id' }
  ) {
    const token = new Token(authToken);
    const p = await token.getMyPermission();

    const { attributes } = require('../db/attributes/users');
    let attr = [],
      scope = [];

    if (p.id == null && params['include'].length == 0) {
      return [];
    }

    if (params['include'] != null) {
      attr.push(...attributes['default']);
      attr.push(...attributes['favorite']);
      scope.push('default');
      params['include'].forEach(function (p: string) {
        if (attributes[p] != null) {
          attr.push(...attributes[p]);
          scope.push(p);
        }
      });
    } else {
      attr.push(...attributes['default']);
      attr.push(...attributes['favorite']);
      scope.push('default');
      scope.push('address');
    }
    // Search only individual users.
    let whereClauses: any[] = [];
    let groups = [];

    if (!p.companyManager && !p.admin) {
      whereClauses.push(Sequelize.literal('"users"."uuid" = ' + `'${p.uuid}'`));
    } else {
      whereClauses.push(Sequelize.literal('"users"."id" <> ' + p.id));

      if (params['filter'] && params['filter'].uuid) {
        whereClauses.push(Sequelize.literal('"users"."uuid" = ' + `'${params['filter'].uuid}'`));
      }
    }

    if (p.id != null || params['include'].length > 0) {
      groups.push('users.id');
    }
    for (const includeKey of params['include']) {
      switch (includeKey) {
        case 'address': {
          groups.push(
            ...[
              'address.address',
              'address.address2',
              'address.state',
              'address.city',
              'address.states.description',
              'address.cities.description',
              'address.zip'
            ]
          );
          if (params['filter'] && params['filter'].location) {
            whereClauses.push(
              Sequelize.literal('"address"."state" = ' + params['filter'].location)
            );
          }
          break;
        }
        case 'cosine': {
          groups.push(...['user_cosines.id', 'user_cosine_data.id']);
          break;
        }
        case 'avatar': {
          groups.push(...['avatar.url']);
          break;
        }
        case 'salary': {
          if (params['filter'] && params['filter'].salary) {
            if (params['filter'].salary.min) {
              whereClauses.push(
                Sequelize.literal('"salary"."salary" >= ' + params['filter'].salary.min)
              );
            }
            if (params['filter'].salary.max) {
              whereClauses.push(
                Sequelize.literal('"salary"."salary" <= ' + params['filter'].salary.max)
              );
            }
          }
          break;
        }
      }
    }

    groups.push(...['favorite.id']);
    if (params['filter'] && params['filter'].favorite != undefined) {
      if (params['filter'].favorite) {
        whereClauses.push(Sequelize.literal('"favorite"."creator" = ' + p.id));
      } else {
        whereClauses.push(Sequelize.literal('"favorite"."id" IS NULL'));
      }
    }

    // Search only individual users.
    whereClauses.push(Sequelize.literal('"roles"."role" = 8'));
    // Exclude users who have withdrawn.
    whereClauses.push(Sequelize.literal('"users"."status" = 1'));

    // Include only activated users.
    scope.push('activate');
    whereClauses.push(Sequelize.literal('"activate"."activated" IS NOT NULL'));

    const currentPage = pagination && pagination.page ? parseInt(pagination.page) : 1;
    const itemsPerPage = pagination && pagination.items ? parseInt(pagination.items) : 25;
    const sortDir = sort && sort.sortDir ? sort.sortDir : 'ASC';
    const sortBy = sort && sort.sortBy ? sort.sortBy : 'id';

    let user = await db.users.scope(scope).findAndCountAll({
      raw: true,
      where: { [Op.and]: whereClauses },
      attributes: attr,
      order: [[sortBy, sortDir]],
      group: groups,
      subQuery: false,
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      required: false,
      include: [
        {
          model: db.user_favorite,
          required: false,
          attributes: [],
          where: {
            creator: p.id
          },
          as: 'favorite'
        }
      ]
    });

    const totalUsers = user.count ? user.count.length : 0;
    user = user.rows;

    return {
      members: user,
      currentPage: currentPage,
      totalMembers: totalUsers,
      totalPages: Math.ceil(totalUsers / itemsPerPage)
    };
  }

  // Change with JWT token Auth.
  async getComapny(userId: any) {
    return db.user_company
      .findOne({
        raw: true,
        where: { userId: userId }
      })
      .then((result: any) => {
        if (result != null) {
          return result['id'];
        } else {
          return 0;
        }
      });
  }

  async getPermissions(uuid: any) {
    const { attributes } = require('../db/attributes/users_user');

    return await db.users
      .scope(['permission', 'company'])
      .findAll({
        raw: true,
        attributes: [...attributes['permission']],
        where: { uuid },
        group: ['users.id', 'company.id', 'company->hq.uuid']
      })
      .then((result: any) => {
        return result[0];
      });
  }

  async getMyInfo(authToken: string | undefined) {
    const token = new Token(authToken);
    const uuid = await token.getUuid();

    const { attributes } = require('../db/attributes/users');

    return db.users
      .scope(['address', 'nickname', 'avatar', 'role'])
      .findAll({
        raw: true,
        attributes: [...attributes['info']],
        group: ['users.id', 'nickname.nickname', 'avatar.url'],
        where: { uuid }
      })
      .then((result: any) => {
        let myInfo: any = {};
        if (result.length > 0) {
          myInfo = result[0];
          myInfo.isAdmin =
            myInfo.roles.indexOf(1) > -1 ||
            myInfo.roles.indexOf(2) > -1 ||
            myInfo.roles.indexOf(3) > -1;
          myInfo.isCompanyAdmin = myInfo.roles.indexOf(4) > -1 || myInfo.roles.indexOf(5) > -1;
          myInfo.isInterviewer = myInfo.roles.indexOf(6) > -1;
          myInfo.isCompanyMember = myInfo.roles.indexOf(7) > -1;
          delete myInfo['roles'];
        }
        return {
          success: 1,
          myInfo: result.length > 0 ? result[0] : {}
        };
      })
      .catch((err: any) => {
        throw new Error(err);
      });
  }

  async getUsersByUUID(users: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(users.id)'), 'ids']);
    } else if (only === 'email') {
      attr.push([Sequelize.literal('array_agg(users.email)'), 'emails']);
    } else if (only === 'name') {
      attr.push([Sequelize.literal('array_agg(concat(users.lastname, users.lastname))'), 'names']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('email');
      attr.push('firstName');
      attr.push('lastName');
    }

    return (await db.users.findAll({
      raw: true,
      attributes: attr,
      where: { uuid: { [Op.in]: users } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      email: string;
      firstName: string;
      lastName: string;
      ids?: Array<number>;
      emails?: Array<string>;
    }>;
  }

  async getUsersByID(users: any, only = '') {
    let attr = [];
    if (only === 'id') {
      attr.push([Sequelize.literal('array_agg(users.id)'), 'ids']);
    } else if (only === 'email') {
      attr.push([Sequelize.literal('array_agg(users.email)'), 'emails']);
    } else if (only === 'name') {
      attr.push([Sequelize.literal('array_agg(concat(users.lastname, users.lastname))'), 'names']);
    } else {
      attr.push('id');
      attr.push('uuid');
      attr.push('email');
      attr.push('firstName');
      attr.push('lastName');
    }

    return (await db.users.findAll({
      raw: true,
      attributes: attr,
      where: { id: { [Op.in]: users } },
      required: false
    })) as Array<{
      id: number;
      uuid: string;
      email: string;
      firstName: string;
      lastName: string;
      ids?: Array<number>;
      emails?: Array<string>;
    }>;
  }

  // Load member information
  async getMemberInfo(authToken: string | undefined) {
    const token = new Token(authToken);
    const uuid = await token.getUuid();

    return db.users
      .scope(['gender'])
      .findAll({
        raw: true,
        attributes: [
          [
            Sequelize.literal(
              'CASE WHEN "gender"."gender" > 0 THEN "gender->gender_type"."description" ELSE ' +
                "'None'" +
                ' END'
            ),
            'gender'
          ]
        ],
        group: ['users.id', 'gender.gender', 'gender->gender_type.description'],
        where: { uuid }
      })
      .then((result: any) => {
        return {
          success: 1,
          result: result[0]
        };
      })
      .catch((err: any) => {
        throw new Error(err);
      });
  }

  async getForm(authToken: string | undefined) {
    const { Sequelize } = require('sequelize');
    const token = new Token(authToken);
    const p = await token.getMyPermission();

    if (
      !p.permissions.includes(5) &&
      !p.permissions.includes(4) &&
      !p.permissions.includes(1) &&
      !p.permissions.includes(2) &&
      !p.permissions.includes(3)
    ) {
      throw new Error('You do not have permission. Please contact Writing.');
    }

    let query = [];
    const militery = await db.user_militery_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'militery']]
    });
    query.push(militery);

    const handicap = await db.user_handicap_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'handicap']]
    });
    query.push(handicap);

    const handicap_weight = await db.user_handicap_weight.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'handicap_weight']]
    });
    query.push(handicap_weight);

    const vulnerable = await db.user_vulnerable_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'vulnerable']]
    });
    query.push(vulnerable);

    const gender = await db.user_gender_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'gender']]
    });
    query.push(gender);

    const age = {
      20: '20s',
      30: '30s',
      40: '40s',
      50: '50s',
      60: '60s',
      70: '70s',
      80: '80s',
      90: '90s'
    };

    const education = await db.user_education_status_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'education']]
    });
    query.push(education);

    const mariage = await db.user_mariage_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'mariage']]
    });
    query.push(mariage);

    const location = await db.address_state.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'location']]
    });
    query.push(location);

    // const salary = 300;
    query.push([{ salary: [200, 300] }]);

    const training = await db.user_training_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'training']]
    });
    query.push(training);

    const computer_certification = await db.user_computer_certification_type.findAll({
      raw: true,
      attributes: [
        [Sequelize.literal('json_object_agg("id", "description")'), 'computer_certification']
      ]
    });
    query.push(computer_certification);

    const hasComputer = await db.user_computer_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'hasComputer']]
    });
    query.push(hasComputer);

    const work = await db.user_work_experience_type.findAll({
      raw: true,
      attributes: [[Sequelize.literal('json_object_agg("id", "description")'), 'work']]
    });

    query.push(work);

    return Promise.all(query)
      .then((values) => {
        let data: { [key: string]: any } = {};

        values.forEach(function (value) {
          data[Object.keys(value[0])[0]] = value[0][Object.keys(value[0])[0]];
        });

        data['age'] = age;
        data['salary'] = { min: 200, max: 300 };
        data['favorite'] = [true, false];
        return data;
      })
      .catch((err: any) => {
        return err;
      });
  }

  async getRates(authToken: string | undefined, id: string | undefined) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();
    if (!id) {
      throw new Error('User ID does not exist.');
    }

    const member = await db.users.findOne({
      raw: true,
      where: { uuid: id }
    });
    if (!member) {
      throw new Error('User does not exist.');
    }

    if (
      !currentUser.permissions.includes(5) &&
      !currentUser.permissions.includes(4) &&
      !currentUser.permissions.includes(1) &&
      !currentUser.permissions.includes(2) &&
      !currentUser.permissions.includes(3)
    ) {
      throw new Error('You do not have permission. Please contact Writing.');
    }

    const rates = await db.user_form_rate.findAll({
      raw: true,
      attributes: [
        'type',
        [Sequelize.col('description.description'), 'description'],
        'score',
        'value'
      ],
      where: { userId: member.id },
      required: false,
      include: [
        {
          model: db.user_form_rate_type,
          required: false,
          attributes: [],
          as: 'description'
        }
      ]
    });

    const average = await db.user_form_summary.findAll({
      raw: true,
      attributes: ['type', [Sequelize.col('description.description'), 'description'], 'average'],
      required: false,
      include: [
        {
          model: db.user_form_rate_type,
          required: false,
          attributes: [],
          as: 'description'
        }
      ]
    });

    return {
      rate: rates,
      average: average,
      uuid: id
    };
  }

  async getMemberListforAdmin(authToken?: string) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (
      !currentUser.permissions.includes(1) &&
      !currentUser.permissions.includes(2) &&
      !currentUser.permissions.includes(3)
    ) {
      throw new Error('You do not have permission.');
    }

    const companyMembers = await db.user_company.findAll({
      raw: true,
      attributes: [[Sequelize.literal('array_agg(DISTINCT "userId")'), 'userIds']]
    });

    const memberList = await db.users.scope(['gender', 'address', 'company', 'role']).findAll({
      raw: true,
      where: {
        id: {
          [Op.in]: companyMembers[0].userIds,
          [Op.not]: [1, 2, 3, 4, 5, 6]
        }
      },
      attributes: [
        'id',
        'uuid',
        [Sequelize.literal('CONCAT("lastName", "firstName")'), 'memberName'],
        [
          Sequelize.literal(
            `CASE WHEN "gender"."gender" > 0 THEN "gender->gender_type"."description" ELSE 'None' END`
          ),
          'gender'
        ],
        [Sequelize.col('address->states.description'), 'stateName'],
        [Sequelize.col('address.state'), 'stateCode'],
        [Sequelize.col('address->cities.description'), 'cityName'],
        [Sequelize.col('address.city'), 'cityCode'],
        [
          Sequelize.literal(
            `coalesce(json_agg(DISTINCT jsonb_build_object('companyId', "company->hq"."id", 'companyUuid', "company->hq"."uuid", 'companyName', "company->hq"."name", 'position', "company"."position")) filter (where "company"."id" > 0), '[]')`
          ),
          'company'
        ],
        [Sequelize.literal('array_agg(DISTINCT roles.role)'), 'permissions']
      ],
      group: [
        'users.id',
        'address.id',
        'address->states.id',
        'address->cities.id',
        'gender.gender',
        'gender->gender_type.id'
      ],
      required: false
    });
    return { success: 1, result: memberList };
  }

  async updateMembersPermission(
    authToken: string | undefined,
    uuid: string,
    data: { role: Array<number> }
  ) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (
      !currentUser.permissions.includes(1) &&
      !currentUser.permissions.includes(2) &&
      !currentUser.permissions.includes(3)
    ) {
      throw new Error('Only administrators can access this page.');
    }

    const getUser = await db.users.findOne({
      raw: true,
      attributes: ['id'],
      where: { uuid: uuid }
    });

    if (!getUser.id) {
      throw new Error('User does not exist.');
    }

    const getUserPermission = await db.user_roles
      .findAll({
        raw: true,
        attributes: ['role'],
        where: { userId: getUser.id }
      })
      .then((result: Array<Object>) => {
        return result.map((r: { role: number }) => r.role);
        //return result.map((r) => Object.values(r)).flat(Infinity);
      });

    // Permissions that remain unchanged
    const stayedPermission = getUserPermission.filter((x: number) => data.role.includes(x));

    // Permissions to be deleted
    const deletedPermission = getUserPermission.filter((x: number) => !data.role.includes(x));

    // Permissions to be added
    const changedPermission = data.role.filter((x: number) => !stayedPermission.includes(x));

    if (changedPermission.length > 0) {
      changedPermission.forEach((x: number) => {
        let values = {
          userId: getUser.id,
          role: x
        };

        return db.user_roles.create(values).then(function (result: any) {
          return { success: 1, result: result };
        });
      });
    }

    if (deletedPermission.length > 0) {
      return await db.user_roles
        .destroy({
          where: {
            userId: getUser.id,
            role: {
              [Op.in]: deletedPermission
            }
          }
        })
        .then(function (result: any) {
          return { success: 1, result: result };
        });
    }
  }
}

export { User };
