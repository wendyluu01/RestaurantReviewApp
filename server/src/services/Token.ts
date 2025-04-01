import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

import db from '../db/models';
import secret from '../db/config/secret';
import { IUser } from '../types/user.types';

class Token {
  public token: string;
  public refreshToken: string;
  public activationToken: string;
  public resetToken: string;

  constructor(token?: string) {
    if (token) {
      if (token.startsWith('Bearer ')) {
        token = token.split('Bearer ')[1];
      }
      this.token = token;
    }
  }

  createToken(user: IUser) {
    this.token = jwt.sign(_.omit(user, 'password'), secret.authSecret, {
      expiresIn: process.env.NODE_ENV == 'development' ? '24h' : '30m'
    });
  }

  async createRefreshToken(userEmail: string) {
    const refreshToken = await jwt.sign({ type: 'refresh' }, secret.authSecret, {
      expiresIn: process.env.NODE_ENV == 'development' ? '24h' : '24h'
    });

    await this.saveRefreshToken(userEmail, refreshToken);

    return refreshToken;
  }

  private saveRefreshToken(userEmail: string, refreshToken: string) {
    return db.users.update(
      { refreshToken: refreshToken, updatedA: new Date() },
      { where: { email: userEmail } }
    );
  }

  async createActivationToken(_t: any, userEmail: string) {
    this.activationToken = jwt.sign(
      { type: 'activation', email: userEmail },
      secret.authSecret,
      {}
    );

    await this.saveActivationToken(_t, userEmail);

    return this.activationToken;
  }

  async createInvitationToken(userEmail: string, companyId: string) {
    const invitationToken = await jwt.sign(
      { type: 'invitation', email: userEmail, company: companyId },
      secret.authSecret,
      {}
    );
    const invitation = await this.saveInvitationToken(userEmail, invitationToken);

    if (!invitation) {
      return null;
    }
    return invitationToken;
  }

  private saveActivationToken(_t: any, userEmail: string) {
    return db.activations.create(
      {
        email: userEmail,
        key: this.activationToken
      },
      { transaction: _t }
    );
  }

  private async saveInvitationToken(userEmail: string, invitationToken: string) {
    try {
      const exist = await db.invitations.findOne({
        raw: true,
        where: { email: userEmail },
        attributes: ['id']
      });
      if (exist) {
        await db.invitations.update(
          { key: invitationToken },
          {
            where: { email: userEmail },
            returning: true
          }
        );
      } else {
        await db.invitations.create({
          email: userEmail,
          key: invitationToken
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async getActivationToken(userEmail: string) {
    return db.activations
      .findOne({
        raw: true,
        where: {
          email: userEmail
        },
        attributes: ['key']
      })
      .then((res: any) => {
        return res == null ? null : res.key;
      });
  }

  async createResetPasswordToken(userEmail: string, ip: string) {
    const exist = await this.checkResetToken(userEmail);
    if (!exist) {
      this.resetToken = await jwt.sign({ type: 'reset', email: userEmail }, secret.authSecret, {});
      await this.saveResetToken(userEmail, ip);
    } else {
      this.resetToken = exist.key;
      await this.updateResetToken(exist.id, this.resetToken, ip);
    }

    return this.resetToken;
  }

  async getUuid() {
    const tes: any = await jwt.verify(this.token, secret.authSecret);
    return tes.uuid;
  }

  async getTokeValues() {
    const tes: any = await jwt.verify(this.token, secret.authSecret);
    return tes;
  }

  async getMyPermission(options: any = []) {
    const uuid = await this.getUuid();
    const { attributes } = require('../db/attributes/users');
    let scope = ['permission', 'company'];
    let attrs = ['firstName', ...attributes['permission'], ...attributes['company']];

    if (options && Array.isArray(options)) {
      await options.forEach((attribute: string) => {
        attrs.push(attribute);
      });
    }

    return await db.users
      .scope(scope)
      .findAll({
        raw: true,
        attributes: attrs,
        where: { uuid },
        group: ['users.id']
      })
      .then((result: string | any[]) => {
        if (result.length > 0) {
          result[0].companyManager =
            result[0].permissions.includes(4) || result[0].permissions.includes(5);
          result[0].interviewer = result[0].permissions.includes(6);
          if (
            result[0].permissions.includes(1) ||
            result[0].permissions.includes(2) ||
            result[0].permissions.includes(3)
          ) {
            result[0].admin = true;
          }

          result[0].companyId = result[0].company.map(
            (c: { companyId: number; companyUuid: string }) => c.companyId
          );
          result[0].isProduction = process.env.NODE_ENV === 'production';
          return result[0];
        } else {
          throw new Error('User is not exist.');
        }
      });
  }

  private saveResetToken(email: string, ip: string) {
    return db.reset_passwords.create({
      email: email,
      key: this.resetToken,
      ip: ip
    });
  }

  private checkResetToken(email: string) {
    return db.reset_passwords.findOne({
      raw: true,
      where: {
        email: email,
        reset: {
          [db.Sequelize.Op.is]: null
        }
      },
      attributes: ['id', 'key']
    });
  }

  private updateResetToken(id: number, token: string, ip: string) {
    return db.reset_passwords.update(
      { key: this.refreshToken, ip: ip, updatedAt: new Date() },
      { where: { id: id } }
    );
  }

  validateRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('There is no refresh token to check.');
    }

    return new Promise((res, rej) => {
      jwt.verify(refreshToken, secret.authSecret, async (err: any) => {
        if (err) {
          rej({
            code: 'refreshExpired',
            message: 'Refresh token expired - session ended.'
          });
        } else {
          try {
            const user = await db.users.findOne({ raw: true, where: { refreshToken } });
            res(user);
          } catch (e) {
            rej(e);
          }
        }
      });
    });
  }

  validateAuthToken(authToken: string) {
    return new Promise((res, rej) => {
      jwt.verify(authToken, secret.authSecret, (err: any) => {
        if (err) {
          rej(err);
        } else {
          res(true);
        }
      });
    });
  }
}

export { Token };
