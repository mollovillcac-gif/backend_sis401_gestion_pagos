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
import { NavierasService } from './navieras.service';
import { CreateNavieraDto } from './dto/create-naviera.dto';
import { UpdateNavieraDto } from './dto/update-naviera.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryNavieraDto } from './dto/query-naviera.dto';

@ApiTags('Navieras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('navieras')
export class NavierasController {
    constructor(private readonly navierasService: NavierasService) {}

    @Post()
    create(@Body() createNavieraDto: CreateNavieraDto) {
        return this.navierasService.create(createNavieraDto);
    }

    @Get()
    findAll(@Query() query: QueryNavieraDto) {
        return this.navierasService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.navierasService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateNavieraDto: UpdateNavieraDto) {
        return this.navierasService.update(+id, updateNavieraDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        console.log('Usuario que realiza la eliminación:', req.user.id);
        return this.navierasService.remove(+id, req.user.id);
    }
}
