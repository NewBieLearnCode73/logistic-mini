import { IsString, IsIn, IsOptional } from 'class-validator';

export class ExportReportDto {
  @IsString()
  @IsIn(['csv', 'pdf', 'xlsx'])
  format!: string;

  @IsString()
  @IsIn(['inventory', 'shipments', 'incidents', 'financial'])
  reportType!: string;

  @IsString()
  @IsOptional()
  @IsIn(['today', 'month', 'quarter', 'year', 'custom'])
  period?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}
