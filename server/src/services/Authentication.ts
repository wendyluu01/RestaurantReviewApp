import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

import db from '../db/models';
import { ILoginIn, IUser } from '../types/user.types';

import { Auth } from './Auth';
// import { User } from './User';
import { Token } from './Token';
import { IAWSEmailTemplate } from './AWS';
// import { Roles } from './Roles';

/**
 * Class to abstract the higher level authentication logic away from
 * specific user actions
 */
class Authentication {
  constructor() {}

  async createUser(
    { invitation }: { invitation?: string },
    { firstName, lastName, email, phone, company, country, language, password }: Partial<IUser>
  ) {
    if (!email || !firstName || !lastName || !password || !phone) {
      throw new Error('You must send all register details.');
    }

    let companyId = null;
    let checkToken;
    let tokenValues;

    if (invitation) {
      checkToken = new Token(invitation);
      tokenValues = await checkToken.getTokeValues();

      const invitationExist = await db.invitations.findOne({
        attributes: ['email', 'key'],
        raw: true,
        where: { key: invitation }
      });

      if (!invitationExist) {
        throw new Error('초대장이 존재하지 않습니다.');
      }

      if (invitationExist.email === tokenValues.email) {
        const companyExist = await db.company.findOne({
          attributes: ['id', 'name'],
          raw: true,
          where: { uuid: tokenValues.company }
        });

        if (companyExist) {
          company = companyExist.name;
          companyId = companyExist.id;
        } else {
          throw new Error('회사가 존재하지 않습니다.');
        }
      } else {
        throw new Error('초대 받은 이메일이 아닙니다.');
      }
    }

    const auth = new Auth(firstName, lastName, email, phone, company, country, language);

    const userExists = await auth.doesUserExist();

    if (userExists && userExists.surveyId && !userExists.password) {
      throw new Error('Your survey information exist.');
    } else if (userExists) {
      throw new Error('User already registered.');
    }

    const t = await db.sequelize.transaction();

    auth.setHashedPassword(this.hashPassword(password));
    const newUser = await auth.saveUser(t);

    if (company && company != '') {
      if (!companyId) {
        const newCompany = await auth.saveCompany(t, newUser.id);
        companyId = newCompany.id;
      }
      await auth.saveUserCompany(t, companyId, newUser.id);
      await auth.saveCompanyMember(t, companyId, newUser.id);

      if (email.includes('@lrighting.com')) {
        await auth.addUserRole(t, newUser.id, [3, 5, 6, 7], 1); // 관리자 롤 추가
      } else if (invitation && tokenValues?.email == email) {
        // 초대 받은경우 7번 직원 권한.
        await auth.addUserRole(t, newUser.id, [5, 6, 7], companyId); // 면접관, 직원 롤 추가
      } else if (!invitation && companyId) {
        // 회사 계정을 생성한경우.
        await auth.addUserRole(t, newUser.id, [4, 5, 6, 7], companyId); // 회사 관리자 롤 추가
      }
    } else {
      await auth.addUserRole(t, newUser.id, [8]); // 개인 롤 추가
    }

    const token = new Token();
    const newKey = await token.createActivationToken(t, email);

    await t.commit();
    const isActivated = await auth.isActivated(email);

    await this.logUserActivity(newUser.id, 'signup');

    // return newUser;
    return isActivated;
  }

  async createMember({ firstName, lastName, email, company, companyId, password }: Partial<IUser>) {
    if (!firstName || !lastName || !email || !company || !companyId || !password) {
      throw new Error('register details');
    }

    const auth = new Auth(firstName, lastName, email, company, password);
    const userExists = await auth.doesUserExist();
    if (userExists) {
      throw new Error('User already registered.');
    }

    const t = await db.sequelize.transaction();

    auth.setHashedPassword(this.hashPassword(password));
    const newUser = await auth.saveUser(t);

    await auth.saveUserCompany(t, companyId, newUser.id);
    await auth.saveCompanyMember(t, companyId, newUser.id);

    await auth.addUserRole(t, newUser.id, [2, 3, 4, 5], companyId);

    const token = new Token();
    const key = await token.createActivationToken(t, email);

    if (!key) {
      await t.rollback();
      throw new Error('no key');
    }

    await t.commit();

    await auth.isActivated(email);
    await this.logUserActivity(newUser.id, 'signup');
    const activate = await auth.activate(email);

    return activate;
  }

  async loginUser({ email, password }: ILoginIn) {
    if (!email || !password) {
      throw new Error('You must send all login details.');
    }

    try {
      const auth = new Auth(null, null, email, null, null, 1, 1);
      const token = new Token();

      const userExists = await auth.doesUserExist();
      if (!userExists) {
        throw new Error('No matching auth.');
      }

      // 탈퇴한 기업의 멤버일 경우
      if (userExists.status === 2) {
        throw new Error('가입한 기업의 정보가 없습니다.');
      }

      const isActivated = await auth.isActivated(email);

      if (isActivated.activate == false) {
        throw new Error('Not Activated yet.');
      }

      try {
        await this.compareHashedPassword(password, userExists.password);
      } catch (e) {
        throw e;
      }

      let u = {
        uuid: userExists.uuid
      } as IUser;

      await token.createToken(u);
      const refreshToken = await token.createRefreshToken(userExists.email);

      await this.logUserActivity(userExists.id, 'login');

      return {
        authToken: token.token,
        refreshToken: refreshToken
      };
    } catch (e) {
      throw e;
    }
  }

  async activate(email: string) {
    const auth = new Auth(null, null, email, null, null, 1, 1);
    return await auth.activate(email);
  }

  async isActivated(email: string) {
    const auth = new Auth(null, null, email, null, null, 1, 1);
    return await auth.isActivated(email);
  }

  private hashPassword(password: string) {
    return password && bcrypt.hashSync(password.trim(), 12);
  }

  private compareHashedPassword(password: string, hashedPassword: string) {
    return new Promise((res, rej) => {
      bcrypt.compare(password, hashedPassword, (err: Error, success: boolean) => {
        if (err) {
          rej(new Error('The has been an unexpected error, please try again later'));
        }
        if (!success) {
          rej(new Error('Your password is incorrect.'));
        } else {
          res(true);
        }
      });
    });
  }

  async resetPassword(data: { email: string; password: string; token: string }) {
    const auth = new Auth(null, null, data.email, null, null, 1, 1);
    const userExists = await auth.doesUserExist();
    if (!userExists) {
      throw new Error('User is not exist.');
    }

    const requested = await auth.checkResetRequest(data.email, data.token);
    if (!requested) {
      throw new Error('Wrong Request.');
    }

    auth.setHashedPassword(this.hashPassword(data.password));

    const result = await auth.resetPassword(data.email);

    // if survey information exist, remove survey flag and activate it.
    if (userExists.surey && result.success === 1) {
      await db.user_survey.destroy({
        where: { userId: userExists.id }
      });
      await this.activate(userExists.email);
    }

    await this.logUserActivity(userExists.id, 'resetPassword');

    return result;
  }

  logUserActivity(userId: number, activity: string) {
    return db.login_activity.create({ userId, activityType: activity });
  }

  async validateToken(tokenToCheck: string) {
    const token = new Token(tokenToCheck);

    if (!token.token) {
      throw new Error('No auth token.');
    }

    return await token.validateAuthToken(token.token);
  }

  async refreshToken(refreshToken: string) {
    let user = await db.users.findOne({
      raw: true,
      where: { refreshToken },
      attributes: ['id', 'uuid', 'email', 'password']
    });

    if (!user) {
      throw new Error('Wrong Request.');
    } else {
      delete user.id;
      delete user.email;
      const token = new Token();
      await token.createToken(user);
      return token.token;
    }
  }
}

export { Authentication };
