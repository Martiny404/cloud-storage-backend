import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { activateAccountTemplate } from './templates/activate-account.template';

@Injectable()
export class MailService {
  host: string = this.configService.get('HOST');
  port: string = this.configService.get('PORT');
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendActivationMail(to: string, link: string): Promise<void> {
    this.mailerService.sendMail({
      to,
      from: this.configService.get('MAIL_USER'),
      subject: 'Активация аккаунта в облачном хранилище: ',
      text: 'Привет! Спасибо за регистрацию и использование нашего сервиса!',
      html: activateAccountTemplate(
        `${this.host}:${this.port}/api/auth/activate/${link}`,
      ),
    });
  }
}
