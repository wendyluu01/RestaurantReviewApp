import db from '../db/models';
import short from 'short-uuid';

class Auth {
  public firstName: string | null;
  public lastName: string | null;
  public email: string;
  public domain: string | null;
  public passwordHash: string | null;

  constructor(
    firstName: string | null,
    lastName: string | null,
    email: string | null ) {
    if (firstName && lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
    }
    if (email) {
      this.email = email;

      const domain = email.split('@')[1];
      const emails = [
        'hotmail.com',
        'naver.com',
        'naver.co.kr',
        'hanmail.net',
        'yahoo.com',
        'yahoo.co.kr'
      ];

      if (!emails.includes(domain)) {
        this.domain = domain;
      }
    }
  }

  setHashedPassword(passwordHash: string) {
    this.passwordHash = passwordHash;

    return this;
  }

  doesUserExist() {
    return db.users_user.findOne({
      raw: true,
      where: { email: this.email },
      attributes: [
        'id',
        'uuid',
        'email',
        'first_name',
        'password'    
      ],
    });
  }

  saveUser(_t: any) {
    return db.users_user.create(
      {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        uuid: short.uuid(),
        password: this.passwordHash
      },
      { transaction: _t }
    );
  }

  checkPermision(email: string, roles: number[]) {}

  addUserRole(
    _t: any,
    memberId: number,
    roles: number[],
    companyId: number | undefined = undefined
  ) {
    // implement here if user roles not exist, add role.
    let data: { userId: number; role: number; companyId?: number }[] = [];
    roles.forEach((role) => {
      if (companyId != undefined) {
        data.push({
          userId: memberId,
          role: role,
          companyId: companyId
        });
      } else {
        data.push({
          userId: memberId,
          role: role
        });
      }
    });

    return db.user_roles.bulkCreate(data, { returning: true, transaction: _t });
  }

  getUser(userId: number) {
    return db.users_user.findOne({
      raw: true,
      where: { id: userId },
      attributes: ['first_name', 'last_name', 'email', 'uuid']
    });
  }

  getUserbyEmail(email: string) {
    return db.users_user.findOne({
      raw: true,
      where: { email: email },
      attributes: ['first_name', 'last_name', 'email', 'uuid']
    });
  }

  checkResetRequest(email: string, key: string) {
    return db.reset_passwords
      .findOne({
        raw: true,
        where: {
          email: email,
          reset: {
            [db.Sequelize.Op.is]: null
          }
        },
        attributes: ['key']
      })
      .then(function (result: any) {
        return result != null && result.key == key;
      });
  }

  resetPassword(email: string) {
    try {
      return db.users
        .update(
          { password: this.passwordHash, updatedAt: new Date() },
          {
            where: { email: email },
            returning: true
          }
        )
        .then(function (result: any) {
          return db.reset_passwords
            .update(
              { reset: new Date(), updatedAt: new Date() },
              {
                where: { email: email },
                returning: true
              }
            )
            .then(function (result: any) {
              return {
                success: 1,
                reset: true
              };
            });
        });
    } catch (err) {
      return {
        success: 0,
        msg: err
      };
    }
  }

  activate(email: string) {
    let value = { activated: new Date() };
    value['updatedAt'] = new Date();
    try {
      return db.activations
        .update(value, {
          where: { email: email },
          returning: true
        })
        .then(function (result: any) {
          return {
            success: result[0] > 0 ? 1 : 0,
            activate: result[0] > 0 ? true : false
          };
        });
    } catch (err) {
      return {
        success: 0,
        msg: err
      };
    }
  }

  isActivated(email: string) {
    return db.activations
      .findOne({
        raw: true,
        where: { email: email },
        attributes: ['activated', 'email']
      })
      .then(function (result: any | null) {
        return {
          success: 1,
          activate: result != null && result.activated != null
        };
      });
  }
}

export { Auth };
