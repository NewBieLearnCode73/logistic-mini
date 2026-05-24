import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentReportEntity } from './entities/incident-report.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('incidents')
@Roles(RoleName.ADMIN)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getIncidents(
    @Query() query: { page?: string; limit?: string },
  ) {
    return this.incidentsService.findAll(query);
  }

  @Post()
  async createIncident(
    @Body() createIncidentDto: CreateIncidentDto,
    @Request() req: any,
  ): Promise<IncidentReportEntity> {
    return this.incidentsService.createIncident(createIncidentDto, req.user);
  }

  @Post(':id/confirm-lost')
  @HttpCode(HttpStatus.OK)
  async confirmLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<IncidentReportEntity> {
    return this.incidentsService.confirmLost(id, req.user);
  }

  @Post(':id/confirm-found')
  @HttpCode(HttpStatus.OK)
  async confirmFound(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<IncidentReportEntity> {
    return this.incidentsService.confirmFound(id, req.user);
  }
}
