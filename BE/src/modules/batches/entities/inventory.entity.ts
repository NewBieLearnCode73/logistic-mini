import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('inventory')
export class InventoryEntity {
  @PrimaryColumn({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @PrimaryColumn({ name: 'node_id', type: 'uuid' })
  nodeId!: string;

  @Column({
    name: 'quantity_available',
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  quantityAvailable!: number;

  @UpdateDateColumn({ name: 'last_updated_at', type: 'timestamptz' })
  lastUpdatedAt!: Date;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;

  // Relations
  @ManyToOne(() => BatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'node_id' })
  node!: NodeEntity;
}
