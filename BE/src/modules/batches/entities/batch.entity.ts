import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BatchStatus } from '../../../common/enums/batch-status.enum';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('batches')
export class BatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_code', length: 100, unique: true })
  batchCode!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'origin_node_id', type: 'uuid' })
  originNodeId!: string;

  @Column({ name: 'current_node_id', type: 'uuid' })
  currentNodeId!: string;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity!: number;

  @Column({ name: 'unit', length: 50 })
  unit!: string;

  @Column({ name: 'manufacture_date', type: 'date' })
  manufactureDate!: Date | string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate!: Date | string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: BatchStatus.CREATED,
  })
  status!: BatchStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;

  // Relations
  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'origin_node_id' })
  originNode!: NodeEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'current_node_id' })
  currentNode!: NodeEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: UserEntity;
}
