import db from '../db/models';
import { AWS, IAWSEmailTemplate } from './AWS';

class Email {
  private displayname: string;
  private from: string;
  private mailServer: string;
  private port: string;
  private smtp: string;
  private id: string;
  private pw: string;
  private secure: boolean;

  constructor() {}

  async sendEmail(data: any) {
    const server = await this.setEmailServer();

    if (server.success == false) {
      return server;
    } else {
      const mail = this.send(data);
      return mail;
    }
  }

  async setEmailServer() {
    return db.settings
      .findOne({
        raw: true,
        where: { key: 'email_setting' },
        attributes: ['value']
      })
      .then(
        (
          result: {
            value: {
              displayname: string;
              from: string;
              server: string;
              port: string;
              smtp: string;
              id: string;
              password: string;
              secure: boolean;
            };
          } | null
        ) => {
          if (result != null) {
            this.displayname = result['value'].displayname ?? '히든그레이스';
            this.from = result['value'].from ?? 'info@hjgrace.com';
            this.mailServer = result['value'].server ?? '';
            this.port = result['value'].port;
            this.smtp = result['value'].smtp;
            this.id = result['value'].id;
            this.pw = result['value'].password;
            this.secure = result['value'].secure;

            return { success: true };
          } else {
            return {
              success: false,
              msg: 'Email Server Setting is not exsit.'
            };
          }
        }
      );
  }

  async sendFromDB(data: any) {
    return db.email_templates
      .findOne({
        raw: true,
        where: { key: data.email_type },
        attributes: ['subject', 'body']
      })
      .then((result: { subject: any; body: any } | null) => {
        if (result == null) {
          return {
            success: false,
            msg: 'Template is not exist.'
          };
        } else {
          let subject = result.subject;
          let body = result.body;

          Object.keys(data.tokens).forEach(function (p) {
            subject = subject.replace('[' + p + ']', data.tokens[p]);
            body = body.replace('[' + p + ']', data.tokens[p]);
          });

          const nodemailer = require('nodemailer');
          let transporter = nodemailer.createTransport({
            // 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
            service: this.mailServer,
            // host를 gmail로 설정
            host: this.smtp,
            port: this.port,
            secure: false,
            auth: {
              // Gmail 주소 입력, 'testmail@gmail.com'
              user: this.id,
              // Gmail 패스워드 입력
              pass: this.pw
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          try {
            transporter.sendMail({
              // 보내는 곳의 이름과, 메일 주소를 입력
              from: `"라이트" <admin@hidden-analysis.com>`,
              // 받는 곳의 메일 주소를 입력
              to: data.sendTo,
              // to: 'info@hjgrace.com',
              // 보내는 메일의 제목을 입력
              subject: subject,
              // 보내는 메일의 내용을 입력
              // text: 일반 text로 작성된 내용
              // html: html로 작성된 내용
              html: `${body}`
            });

            return {
              success: true,
              msg: 'Successfully sent.'
            };
          } catch (e) {
            return {
              success: true,
              msg: e
            };
          }
        }
      });
  }

  async send(data: any) {
    const aws = new AWS();

    const template = await aws.getAWSSESTemplateForSMTP({ templateName: data.template });

    if (!template.success) {
      return {
        success: template.success,
        msg: template.result
      };
    }

    let subject = template.result.SubjectPart;
    let body = template.result.HtmlPart;

    Object.keys(data.token).forEach(function (p) {
      subject = subject.replace('{{' + p + '}}', data.token[p]);
      body = body.replace('{{' + p + '}}', data.token[p]);
    });

    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
      // 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
      // service: this.mailServer,
      // host를 gmail로 설정
      host: this.smtp,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.id,
        pass: this.pw
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      const emailValues = {
        // 보내는 곳의 이름과, 메일 주소를 입력
        from: `"${this.displayname}" <${this.from}>`,
        // 받는 곳의 메일 주소를 입력
        to: Array.isArray(data.to) ? data.to.join(';') : data.to,
        // to: 'info@hjgrace.com',
        // 보내는 메일의 제목을 입력
        subject: subject,
        // 보내는 메일의 내용을 입력
        // text: 일반 text로 작성된 내용
        // html: html로 작성된 내용
        html: `${body}`
      };

      if (data.bcc != '' && data.bcc != null) {
        emailValues['bcc'] = Array.isArray(data.bcc) ? data.bcc.join(';') : data.bcc;
      }

      if (process.env.NODE_ENV != 'production') {
        emailValues['to'] = 'test.email@hjgrace.com';
        emailValues['bcc'] = 'lright_test@hjgrace.com';
      }

      const result = await transporter.sendMail(emailValues);

      return {
        success: true,
        msg: 'Successfully sent.'
      };
    } catch (e) {
      return {
        success: false,
        msg: e
      };
    }
  }

  async sendAWSSES(data: IAWSEmailTemplate) {
    const aws = new AWS();
    let values: IAWSEmailTemplate = {
      token: data.token,
      to: data.to,
      reply: data.reply,
      bcc: data.bcc,
      from: data.from,
      template: data.template
    };
    const result = await aws.sendTemplatedEmail(values);

    return result;
  }
}

export { Email };
