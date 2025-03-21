import db from '../db/models';
import jsonData from '../../.aws/aws_security.json';
import { Token } from './Token';
import { S3, SES } from 'aws-sdk';
// import { User } from './User';
const { Op } = require('sequelize');

export interface IAWSEmailTemplate {
  to: SES.AddressList;
  token: Record<string, any>;
  from: string;
  template: string;
  reply?: SES.AddressList;
  bcc: SES.AddressList;
}

/**
 * Project APIs
 */
class AWS {
  constructor() {}

  private getSES() {
    let aws = require('aws-sdk');
    aws.config.update(jsonData.SES);
    return new aws.SES() as SES;
  }

  private getS3() {
    let aws = require('aws-sdk');
    aws.config.update(jsonData.S3);
    return new aws.S3() as S3;
  }

  async sendTemplatedEmail(data: IAWSEmailTemplate) {
    if (
      data['token'] === undefined ||
      data['from'] === undefined ||
      data['template'] === undefined
    ) {
      throw new Error('이메일 발송에 필요한 정보를 모두 입력해주세요.');
    }

    const ses = this.getSES();

    let sendTo = Array.isArray(data['to']) ? data['to'] : [data['to']];
    let sendFrom = data['from'] ?? '=?UTF-8?B?65287J6H7YyF?=<info@test.com>';
    let replyTo = Array.isArray(data['reply']) ? data['reply'] : [sendFrom];
    let bcc = Array.isArray(data['bcc']) ? data['bcc'] : [];

    if (process.env.NODE_ENV != 'production') {
      sendTo = ['test.email@test.com'];
      bcc = ['lright_test@test.com'];
    }

    var params: SES.SendTemplatedEmailRequest = {
      Destination: {
        /* required */
        // CcAddresses: [
        //   'info@test.com',
        //   /* more CC email addresses */
        // ],
        BccAddresses: bcc, // 배열
        ToAddresses: sendTo // 배열
      },
      Source: sendFrom /* required */,
      Template: data['template'] /* required */,
      TemplateData: JSON.stringify(data.token) /* required */,
      ReplyToAddresses: replyTo // 배열
    };

    let result = ses.sendTemplatedEmail(params).promise();
    return result
      .then(function (data: any) {
        return {
          success: true,
          msg: 'success'
        };
      })
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: params, error: err })
        });
        return {
          success: false,
          msg: err.message
        };
      });
  }

  async getAWSSESTemplateForSMTP(data: { templateName: string }) {
    const ses = this.getSES();

    let result = await ses
      .getTemplate({ TemplateName: data.templateName })
      .promise()
      .then((data: any) => ({ success: true, result: data['Template'] }))
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: { TemplateName: data.templateName }, error: err })
        });
        return {
          success: false,
          result: err.message
        };
      });

    return result;
  }

  async getAWSSESTemplate(authToken: string | undefined, data: { templateName: string }) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission.');
    }

    const ses = this.getSES();

    let result = await ses
      .getTemplate({ TemplateName: data.templateName })
      .promise()
      .then((data: any) => ({ success: true, result: data['Template'] }))
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: { TemplateName: data.templateName }, error: err })
        });
        return {
          success: false,
          msg: err.message
        };
      });

    return result;
  }

  async createAWSSESTemplate(
    authToken: any,
    data: {
      templateName: string;
      subjectPart: string;
      htmlPart: string;
    }
  ) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission.');
    }

    const ses = this.getSES();

    const params = {
      Template: {
        TemplateName: data.templateName,
        SubjectPart: data.subjectPart,
        HtmlPart: data.htmlPart
      }
    };

    let result = await ses
      .createTemplate(params)
      .promise()
      .then((data: any) => ({ success: true }))
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: params, error: err })
        });
        return {
          success: false,
          msg: err.message
        };
      });
    return result;
  }

  async updateAWSSESTemplate(
    authToken: any,
    data: {
      templateName: string;
      subjectPart: string;
      htmlPart: string;
    }
  ) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission.');
    }

    const ses = this.getSES();

    const getTemplate = await ses
      .getTemplate({ TemplateName: data.templateName })
      .promise()
      .then((data: any) => ({ success: true, result: data['Template'] }));

    if (!getTemplate?.success) {
      throw new Error('존재하지 않는 템플릿입니다.');
    }

    const regExp = /{{[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z\-\_]+}}/g;

    const params = {
      Template: {
        TemplateName: data.templateName,
        SubjectPart: data.subjectPart,
        HtmlPart: data.htmlPart
      }
    };

    const subjectToken = params.Template.SubjectPart.match(regExp);
    const htmlToken = params.Template.HtmlPart.match(regExp);

    async function saveToken(templateId: number) {
      if (subjectToken !== null && htmlToken !== null) {
        const tokenName: Array<string> = [];
        subjectToken.map((token: string) => tokenName.push(token));
        htmlToken.map((token: string) => tokenName.push(token));

        const tokenExist = await db.tokens
          .findAll({
            raw: true,
            attributes: ['tokenName'],
            where: {
              templateId: templateId
            }
          })
          .then((result: Array<object>) => result.map((t: { tokenName: string }) => t.tokenName));

        const diffirentToken = tokenName.filter((x: string) => !tokenExist.includes(x));

        if (diffirentToken.length > 0) {
          diffirentToken.forEach(async (value: string) => {
            const values = {
              templateId: templateId,
              tokenName: value
            };
            return await db.tokens.create(values);
          });
        }
      }
    }

    switch (data.templateName) {
      case 'activation':
        saveToken(1);
        break;
      case 'resetPassword':
        saveToken(2);
        break;
      case 'invitation':
        saveToken(3);
        break;
      case 'question':
        saveToken(4);
        break;
      case 'question_registered':
        saveToken(5);
        break;
    }

    let result = await ses
      .updateTemplate(params)
      .promise()
      .then((data: any) => ({ success: true }))
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: params, error: err })
        });
        return {
          success: false,
          msg: err.message
        };
      });
    return result;
  }

  async getAWSSESTemplateList(authToken: string | undefined, data: any) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission.');
    }

    const ses = this.getSES();

    let result = ses.listTemplates({ MaxItems: data.itemsCount }).promise();
    return result
      .then(function (data: any) {
        const templateList = data['TemplatesMetadata'].map((t: { Name: string }) => t.Name);
        return {
          success: true,
          result: templateList
          //result: {responseMetadata: data['ResponseMetadata'], templatesMetadata: data['TemplatesMetadata']}
        };
      })
      .catch(function (err: any) {
        db.logs.create({
          modeule: 'AWS SES',
          eooros: JSON.stringify({ params: { MaxItems: data.itemsCount }, error: err })
        });
        return { success: false, msg: err.message };
      });
  }

  async deleteAWSSESTemplate(authToken: any, data: any) {
    const token = new Token(authToken);
    const currentUser = await token.getMyPermission();

    if (!currentUser.admin) {
      throw new Error('You do not have permission.');
    }

    const ses = this.getSES();

    let result = ses.deleteTemplate({ TemplateName: data.templateName }).promise();
    return result
      .then(function (data: any) {
        return {
          success: true
        };
      })
      .catch(function (err: any) {
        db.logs.create({
          module: 'AWS SES',
          errors: JSON.stringify({ params: { TemplateName: data.templateName }, error: err })
        });
        return {
          success: false,
          msg: err.message
        };
      });
  }

  async uploadFile(params: { Bucket: string; Body: any; Key: string }) {
    const s3 = this.getS3();

    const uploaded = await s3.upload(params).promise();

    // 리턴 예제
    //  ETag: '"48692afb035e835cdd6c35606b7fd9b2"',
    //  Location: 'https://s3.ap-northeast-2.amazonaws.com/lright.public/avatars/avatar21311.jpeg',
    //  key: 'avatars/avatar21311.jpeg',
    //  Key: 'avatars/avatar21311.jpeg',
    //  Bucket: 'lright.public'

    return uploaded;
  }

  async getFile(options: { Bucket: string; Key: string }): Promise<string> {
    const s3 = this.getS3();
    return await s3
      .getObject(options)
      .promise()
      .then((res: any) => res.Body.toString('base64'));

    // 리턴 예제
    //  Body: ArrayBuffer -> base64변환
  }

  getFileStream(Bucket: string, Key: string) {
    const s3 = this.getS3();
    return s3.getObject({ Bucket, Key }).createReadStream();
  }

  async deleteFile(options: { Bucket: string; Key: string }) {
    const s3 = this.getS3();
    return await s3.deleteObject(options).promise();
  }
}

export { AWS };
