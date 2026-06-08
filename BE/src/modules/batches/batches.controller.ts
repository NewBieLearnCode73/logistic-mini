import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { SellBatchDto } from './dto/sell-batch.dto';
import { BatchEntity } from './entities/batch.entity';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Roles(RoleName.MANUFACTURER, RoleName.ADMIN)
  async create(
    @Body() createBatchDto: CreateBatchDto,
    @Request() req: any,
  ): Promise<BatchEntity> {
    return this.batchesService.create(createBatchDto, req.user);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  async findAll(
    @Query() query: any,
    @Request() req: any,
  ): Promise<any> {
    return this.batchesService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  async findDetails(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.batchesService.findDetails(id, req.user);
  }

  @Get(':id/timeline')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  async getTimeline(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Request() req: any,
  ): Promise<TimelineEventEntity[]> {
    return this.batchesService.getTimeline(id, req.user);
  }

  @Post(':id/sell')
  @Roles(RoleName.RETAILER, RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  async sell(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() sellBatchDto: SellBatchDto,
    @Request() req: any,
  ): Promise<any> {
    return this.batchesService.sell(id, sellBatchDto, req.user);
  }

  @Post(':id/regenerate-qr')
  @Roles(RoleName.MANUFACTURER, RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  async regenerateQr(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Request() req: any,
  ): Promise<BatchQrCodeEntity> {
    return this.batchesService.regenerateQr(id, req.user);
  }
}
