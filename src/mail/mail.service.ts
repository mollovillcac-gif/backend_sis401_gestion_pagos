// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de contraseña',
        template: './password-reset',
        context: {
          name: userName || 'Usuario',
          resetUrl,
          resetToken,
        },
      });
      
      return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  async sendPasswordResetConfirmation(email: string, userName?: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Contraseña actualizada exitosamente',
        template: './password-reset-confirmation',
        context: {
          name: userName || 'Usuario',
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error enviando confirmación:', error);
      throw new Error('Error al enviar confirmación');
    }
  }
}