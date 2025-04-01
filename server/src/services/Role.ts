import db from '../db/models';

/**
 * User APIs
 */
class User {
  constructor() {}

  async getUsers(params: any) {
    const { attributes } = require('../db/attributes/users');
    let attr = [],
      scope = [],
      queries = {};

    if (params['userId'] == null && params['include'].length == 0) {
      return [];
    }

    if (params['include'] != null) {
      attr.push(...attributes['default']);
      params['include'].forEach(function (p: string) {
        if (attributes[p] != null) {
          attr.push(...attributes[p]);
          scope.push(p);
        }
      });
    } else {
      attr.push(...attributes['default']);
      scope.push('address');
    }

    // implement here for condition.
    let where = {};
    let groups = [];

    if (params['userId'] != null) {
      where['id'] = params['userId'];
    }

    if (params['userId'] != null) {
      where['id'] = params['userId'];
    }

    if (params['userId'] != null || params['include'].length > 0) {
      groups.push('users.id');
    }

    if (params['include'].includes('address') == true) {
      groups.push(
        ...[
          'address',
          'address2',
          'state',
          'city',
          'address.states.description',
          'address.cities.description',
          'zip',
          'company.companyId',
          'company.start',
          'company.end'
        ]
      );
    }

    if (params['include'].includes('cosine') == true) {
      groups.push(...['user_cosines.id']);
    }

    if (params['include'].includes('rate') == true) {
      groups.push(...['user_rates.id']);
    }

    if (params['include'].includes('militery') == true) {
      groups.push(...['militery.id']);
    }

    if (params['include'].includes('mariage') == true) {
      groups.push(...['mariage.id']);
    }

    if (params['include'].includes('training') == true) {
      groups.push(...['training.id']);
    }

    let user = db.users.scope(scope).findAll({
      raw: true,
      where: where,
      attributes: attr,
      order: [['id', 'ASC']],
      group: groups,
      required: false
    });
    queries['user'] = user;

    return Promise.all(Object.values(queries))
      .then((results) => {
        let data = {};
        for (const [index, element] of Object.keys(queries).entries()) {
          data[element] = results[index];
        }
        return data;
      })
      .catch((err) => {
        return err;
      });

    // return db.users.scope(scope).findAll({
    //   raw: true,
    //   where: { id: 1},
    //   attributes: attr,
    //   order: [['id', 'ASC']],
    //   required: false,
    // });
  }

  // Change with JWT token Auth.
  async getComapny(userId: any) {
    return db.user_company
      .findOne({
        raw: true,
        where: { userId: userId }
      })
      .then((result: { [x: string]: any } | null) => {
        if (result != null) {
          return result['id'];
        } else {
          return 0;
        }
      });
  }
}

export { User };
