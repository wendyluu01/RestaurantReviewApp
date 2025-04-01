import db from '../db/models';
import { Token } from './Token';

/**
 * User APIs
 */
class Work {
  constructor() {}

  async updateWork(authToken: string | undefined, data: any) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    // 데이터 한개만 검색하기
    const workExist = await db.user_work_experience.findOne({
      raw: true,
      attributes: ['id'],
      where: { userId: currentUser.id }
    });

    let work = {};
    // 만약에 WorkId 가 존재하면 업데이트 합니다.
    if (workExist != null) {
      let values = data;
      delete values.userId;
      values['updatedAt'] = new Date();
      values['userId'] = currentUser.id;
      work = await db.user_work_experience
        .update(values, {
          where: { id: workExist.id },
          returning: true
        })
        .then(function (result: { get: () => any }[][]) {
          return result[1][0].get();
        });
    }
    // 만약에 WorkId 가 존재하지 않는다면 새로 추가 합니다.
    else if (workExist == null) {
      const values = data;
      values['userId'] = currentUser.id;
      work = await db.user_work_experience
        .create(values)
        .then(function (result: { get: () => any }) {
          return result.get();
        });
    }
    return work;
  }
}

export { Work };
