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
    { firstName, lastName, email, password }: Partial<IUser>
  ) {
    if (!email || !firstName || !lastName || !password) {
      throw new Error('You must send all register details.');
    }

    let companyId = null;
    let checkToken;
    let tokenValues;

    const auth = new Auth(firstName, lastName, email);

    const userExists = await auth.doesUserExist();

    if (userExists) {
      throw new Error('User already registered.');
    }


    const t = await db.sequelize.transaction();
    auth.setHashedPassword(this.hashPassword(password));
    const newUser = await auth.saveUser(t);
    const token = new Token();
    const newKey = await token.createActivationToken(t, email);

    await t.commit();

    // await this.logUserActivity(newUser.id, 'signup');

    return newKey;
  }

  async createMember({ firstName, lastName, email, password }: Partial<IUser>) {
    if (!firstName || !lastName || !email || !password) {
      throw new Error('register details');
    }

    const auth = new Auth(firstName, lastName, email);
    const userExists = await auth.doesUserExist();
    if (userExists) {
      throw new Error('User already registered.');
    }

    const t = await db.sequelize.transaction();

    auth.setHashedPassword(this.hashPassword(password));
    const newUser = await auth.saveUser(t);

    const token = new Token();
    const key = await token.createActivationToken(t, email);

    if (!key) {
      await t.rollback();
      throw new Error('no key');
    }

    await t.commit();

    return key;
  }

  async loginUser({ email, password }: ILoginIn) {
    if (!email || !password) {
      throw new Error('You must send all login details.');
    }

    try {
      const auth = new Auth(null, null, email);
      const token = new Token();

      const userExists = await auth.doesUserExist();
      if (!userExists) {
        throw new Error('No matching auth.');
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

      return {
        id: userExists.id,
        name: userExists.first_name,
        authToken: token.token,
        refreshToken: refreshToken
      };
    } catch (e) {
      throw e;
    }
  }

  async activate(email: string) {
    const auth = new Auth(null, null, email);
    return await auth.activate(email);
  }

  async isActivated(email: string) {
    const auth = new Auth(null, null, email,);
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
