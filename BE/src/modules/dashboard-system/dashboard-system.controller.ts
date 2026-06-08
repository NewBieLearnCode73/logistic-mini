import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { DashboardSystemService } from './dashboard-system.service';
import { ExportReportDto } from './dto/export-report.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller()
export class DashboardSystemController {
  constructor(private readonly service: DashboardSystemService) {}

  @Get('dashboard/stats')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  @HttpCode(HttpStatus.OK)
  async getStats(@Request() req: any) {
    return this.service.getStats(req.user);
  }

  @Get('audit-logs')
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(@Query() query: { page?: string; limit?: string }) {
    return this.service.getAuditLogs(query);
  }

  @Post('reports/export')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER)
  async exportReport(
    @Body() dto: ExportReportDto,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    const report = await this.service.exportReport(dto.reportType, dto.format, dto.period, req.user);
    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
    res.send(report.content);
  }
}
