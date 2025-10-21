import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
    private tokenBlacklist: Set<string> = new Set();

    constructor(
        private usuarioService: UsuariosService,
        private jwtService: JwtService,
        private mailService: MailService // Inyecta el servicio de correo
    ) {}

    async login(authLoginDto: AuthLoginDto): Promise<any> {
        const { usuario, clave } = authLoginDto;
        const usuarioOk = await this.usuarioService.validate(usuario, clave);

        if (!usuarioOk) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: usuarioOk.id };
        const access_token = this.getAccessToken(payload);

        return { ...usuarioOk, access_token };
    }

    getAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_TOKEN,
            expiresIn: process.env.JWT_TOKEN_EXPIRATION,
        });
    }

    async verifyPayload(payload: JwtPayload): Promise<Usuario> {
        const usuario = await this.usuarioService.findOne(payload.sub);
        if (!usuario) {
            throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`);
        }
        return usuario;
    }

    logout(token: string): void {
        if (token) {
            this.tokenBlacklist.add(token);
        }
    }

    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklist.has(token);
    }

    async changePassword(userId: number, { oldPassword, newPassword }: ChangePasswordDto) {
        const user = await this.usuarioService.findOne(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.clave);
        if (!isPasswordValid) {
            throw new BadRequestException('La contraseña actual no es válida');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.usuarioService.updatePassword(userId, hashedNewPassword);

        return { message: 'Contraseña actualizada exitosamente' };
    }

    // NUEVOS MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA

    async forgotPassword(correo: string) {
        const user = await this.usuarioService.findByEmail(correo);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado con ese correo');
        }

        // Generar token de recuperación (válido por 15 minutos)
        const resetToken = this.jwtService.sign(
            { userId: user.id, correo: user.correo },
            {
                secret: process.env.JWT_TOKEN,
                expiresIn: process.env.JWT_TOKEN_EXPIRATION || '15m',
            }
        );

        await this.mailService.sendPasswordResetEmail(
            user.correo,
            resetToken,
            user.nombre || user.usuario
        );

        return {
            message: 'Correo de recuperación enviado exitosamente',
            success: true,
        };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const decoded = this.jwtService.decode(token) as any;

            if (!decoded || !decoded.userId) {
                throw new BadRequestException('Token inválido');
            }

            const user = await this.usuarioService.findOne(decoded.userId);

            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }

            // Verificar token con el secreto global
            this.jwtService.verify(token, {
                secret: process.env.JWT_TOKEN,
            });

            // Hashear nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            await this.usuarioService.updatePassword(user.id, hashedPassword);

            // Enviar confirmación por correo
            await this.mailService.sendPasswordResetConfirmation(
                user.correo,
                user.nombre || user.usuario
            );

            return {
                message: 'Contraseña actualizada exitosamente',
                success: true,
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException('El token ha expirado');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new BadRequestException('Token inválido');
            }
            throw error;
        }
    }

    async verifyResetToken(token: string) {
        try {
            const decoded = this.jwtService.decode(token) as any;
            if (!decoded || !decoded.userId) {
                return { valid: false, message: 'Token inválido' };
            }

            const user = await this.usuarioService.findOne(decoded.userId);
            if (!user) {
                return { valid: false, message: 'Usuario no encontrado' };
            }

            // Verificar token con el secreto global
            this.jwtService.verify(token, {
                secret: process.env.JWT_TOKEN,
            });

            return { valid: true, message: 'Token válido' };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { valid: false, message: 'Token expirado' };
            }
            return { valid: false, message: 'Token inválido' };
        }
    }
}
