import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsString()
    token: string;
}
