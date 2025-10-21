import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'Correo electrónico del usuario para recuperar la contraseña',
    })
    @IsEmail({}, { message: 'Por favor, ingrese un correo electrónico válido.' })
    email: string;
}
