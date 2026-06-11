import { Controller, Post, Patch, Get, Query, Body, Param, Request, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ReceiveShipmentDto } from './dto/receive-shipment.dto';
import { ShipmentEntity } from './entities/shipment.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('shipments')
@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createShipmentDto: CreateShipmentDto,
    @Request() req: any,
  ): Promise<ShipmentEntity> {
    return this.shipmentsService.createTransfer(createShipmentDto, req.user);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: { page?: string; limit?: string },
    @Request() req: any,
  ) {
    return this.shipmentsService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Request() req: any,
  ) {
    return this.shipmentsService.findOne(id, req.user);
  }

  @Patch(':id/receive')
  @Roles(RoleName.ADMIN, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  @HttpCode(HttpStatus.OK)
  async receive(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() receiveShipmentDto: ReceiveShipmentDto,
    @Request() req: any,
  ): Promise<ShipmentEntity> {
    return this.shipmentsService.receiveShipment(id, receiveShipmentDto, req.user);
  }
}
