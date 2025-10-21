import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Validate } from 'class-validator';
import { PasswordsNotEqualConstraint } from '../decorators/password.decorator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'currentPassword123',
        description: 'La contraseña actual del usuario.',
    })
    @IsString()
    @MinLength(6, { message: 'La contraseña actual debe tener al menos 6 caracteres.' })
    @MaxLength(20, { message: 'La contraseña actual no debe exceder los 20 caracteres.' })
    oldPassword: string;

    @ApiProperty({
        example: 'newPassword456',
        description: 'La nueva contraseña que el usuario desea establecer.',
    })
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
    @MaxLength(20, { message: 'La nueva contraseña no debe exceder los 20 caracteres.' })
    @Validate(PasswordsNotEqualConstraint)
    newPassword: string;
}
