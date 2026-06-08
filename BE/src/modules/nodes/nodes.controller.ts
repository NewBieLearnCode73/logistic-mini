import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NodeEntity } from './entities/node.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('nodes')
@Roles(RoleName.ADMIN)
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNodeDto: CreateNodeDto): Promise<NodeEntity> {
    return this.nodesService.create(createNodeDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('includeInventory') includeInventory?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const includeInvBool = includeInventory === 'true';
    let isActiveVal: boolean | 'all' | undefined = undefined;

    if (isActive === 'true') {
      isActiveVal = true;
    } else if (isActive === 'false') {
      isActiveVal = false;
    } else if (isActive === 'all') {
      isActiveVal = 'all';
    }

    return this.nodesService.findAll({
      page: pageNum,
      limit: limitNum,
      includeInventory: includeInvBool,
      isActive: isActiveVal,
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<any> {
    return this.nodesService.findDetails(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() updateNodeDto: UpdateNodeDto,
  ): Promise<NodeEntity> {
    return this.nodesService.update(id, updateNodeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<void> {
    await this.nodesService.delete(id);
  }
}
