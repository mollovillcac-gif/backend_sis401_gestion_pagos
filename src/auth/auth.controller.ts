import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() authLoginDto: AuthLoginDto): Promise<any> {
        return this.authService.login(authLoginDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
        const userId = req.user.id;
        return this.authService.changePassword(userId, changePasswordDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req): Promise<any> {
        const token = req.headers.authorization?.split(' ')[1];
        await this.authService.logout(token);
        return { message: 'Logout exitoso' };
    }

    // NUEVOS ENDPOINTS PARA RECUPERACIÓN DE CONTRASEÑA

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;
        return await this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        return await this.authService.resetPassword(token, newPassword);
    }

    @Post('verify-reset-token')
    @HttpCode(HttpStatus.OK)
    async verifyResetToken(@Body() verifyTokenDto: VerifyTokenDto) {
        const { token } = verifyTokenDto;
        return await this.authService.verifyResetToken(token);
    }
}
