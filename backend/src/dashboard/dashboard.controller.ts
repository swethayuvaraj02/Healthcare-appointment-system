import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}