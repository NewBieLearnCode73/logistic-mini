import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SellBatchDto {
  @IsNotEmpty({ message: 'Số lượng bán không được để trống' })
  @IsNumber({}, { message: 'Số lượng bán phải là một số' })
  @Min(0.001, { message: 'Số lượng bán phải lớn hơn 0' })
  quantity!: number;
}
