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
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryRolDto } from './dto/query-rol.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createRolDto: CreateRolDto) {
        return this.rolesService.create(createRolDto);
    }

    @Get()
    findAll(@Query() query: QueryRolDto) {
        return this.rolesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(+id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto) {
        return this.rolesService.update(+id, updateRolDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        console.log('Usuario que realiza la eliminación:', req.user.id);
        return this.rolesService.remove(+id, req.user.id);
    }
}
