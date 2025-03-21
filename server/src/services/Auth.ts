import db from '../db/models';
import short from 'short-uuid';

class Auth {
  public firstName: string;
  public lastName: string;
  public email: string;
  public phone: string | null;
  public company: string | null;
  public country: number | null;
  public language: number;
  public domain: string;
  public passwordHash: string;

  constructor(
    firstName: string | null,
    lastName: string | null,
    email: string | null,
    phone: string | null,
    company: string | null = null,
    country: number = 1,
    language: number = 1
  ) {
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

    if (company) {
      this.company = company;
    }
    this.phone = phone;
    this.country = country;
    this.language = language;
  }

  setHashedPassword(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  doesUserExist() {
    return db.users.findOne({
      raw: true,
      where: { email: this.email },
      attributes: [
        'id',
        'uuid',
        'email',
        'firstName',
        'password',
        'status',
        [db.Sequelize.col('survey.id'), 'surveyId']
      ],
      include: [
        {
          model: db.user_survey,
          required: false,
          attributes: [],
          as: 'survey'
        }
      ]
    });
  }

  saveUser(_t: any) {
    return db.users.create(
      {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        uuid: short.uuid(),
        password: this.passwordHash
      },
      { transaction: _t }
    );
  }

  saveCompany(_t: any, ownerId: number) {
    return db.company.create(
      {
        owner: ownerId,
        uuid: short.uuid(),
        domain: this.domain,
        name: this.company,
        country: this.country,
        language: this.language,
        manager: ownerId
      },
      { transaction: _t }
    );
  }

  saveCompanyMember(_t: any, companyId: number, memberId: number) {
    return db.company_members.create(
      {
        companyId: companyId,
        userId: memberId
      },
      { transaction: _t }
    );
  }

  saveUserCompany(_t: any, companyId: number, memberId: number) {
    return db.user_company.create(
      {
        companyId: companyId,
        userId: memberId
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
    return db.users.findOne({
      raw: true,
      where: { id: userId },
      attributes: ['firstName', 'lastName', 'email', 'uuid']
    });
  }

  getUserbyEmail(email: string) {
    return db.users.findOne({
      raw: true,
      where: { email: email },
      attributes: ['firstName', 'lastName', 'email', 'uuid']
    });
  }

  fromSurvey(email: string) {
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
}

export { Auth };
