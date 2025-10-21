import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'abc123token' })
    @IsString()
    token: string;

    @ApiProperty({ example: 'newSecurePassword', minLength: 6 })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
