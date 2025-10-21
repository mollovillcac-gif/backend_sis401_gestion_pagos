import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Req,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Post()
    create(@Body() createUsuarioDto: CreateUsuarioDto) {
        return this.usuariosService.create(createUsuarioDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Query() query: QueryUsuarioDto) {
        return this.usuariosService.findAll(query);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usuariosService.findOne(+id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
        return this.usuariosService.update(+id, updateUsuarioDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        console.log('Usuario que realiza la eliminación del usuario:', req.user.id);
        return this.usuariosService.remove(+id, req.user.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':id/reset-password')
    resetPassword(@Param('id') id: string) {
        return this.usuariosService.resetPassword(+id);
    }
}
