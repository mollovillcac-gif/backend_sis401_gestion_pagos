import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('data')
    async getDashboardData() {
        return await this.dashboardService.getDashboardData();
    }
}
