import { IsString, IsIn } from 'class-validator';

export class ExportReportDto {
  @IsString()
  @IsIn(['csv', 'pdf'])
  format!: string;

  @IsString()
  @IsIn(['inventory', 'shipments', 'incidents'])
  reportType!: string;

  @IsString()
  @IsIn(['today', 'month', 'quarter', 'year'])
  period!: string;
}
