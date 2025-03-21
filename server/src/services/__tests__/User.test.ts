import db from '../../db/models';
import * as jwt from 'jsonwebtoken';
import secret from '../../db/config/secret';
// import * as faker from 'faker';

import { Authentication } from '../Authentication';
// import { User } from '../User';
import { Auth } from '../Auth';

describe('test the User service', () => {
  let thisDb: any = db;

  beforeAll(async () => {
    await thisDb.sequelize.sync({ force: true });
  });

  it('should return user details if a user exists', async () => {
    const authentication = new Authentication();
    // const randomString = faker.random.alphaNumeric(10);
    // const user = new User(`John`, `Smith`, `user-${randomString}@test.com`);
    const user = new Auth(null, null, 'test@email.com', null, null, 1, 1);
    const password = `password`;
    const authToken = await jwt.sign({ type: 'refresh' }, secret.authSecret, { expiresIn: '24h' });

    await authentication.createUser(
      {},
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'test@email.com',
        phone: '111-222-3333',
        password
      }
    );

    const doesUserExist = await user.doesUserExist();

    expect(doesUserExist).toMatchObject({
      id: expect.any(Number)
    });
  });

  it('should return null if a user does not exist', async () => {
    // const randomString = faker.random.alphaNumeric(10);
    // const user = new User(`John`, `Smith`, `user-${randomString}@test.com`);
    const user = new Auth(null, null, 'test@email.com', null, null, 1, 1);
    const doesUserExist = await user.doesUserExist();

    expect(doesUserExist).toBeNull();
  });

  afterAll(async () => {
    await thisDb.sequelize.close();
  });
});
