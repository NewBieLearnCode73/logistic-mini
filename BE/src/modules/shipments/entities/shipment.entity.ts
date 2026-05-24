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
import { BatchEntity } from '../../batches/entities/batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ShipmentStatus } from '../../../common/enums/shipment-status.enum';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('shipments')
export class ShipmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tracking_code', length: 100, unique: true })
  trackingCode!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({ name: 'source_node_id', type: 'uuid' })
  sourceNodeId!: string;

  @Column({ name: 'destination_node_id', type: 'uuid' })
  destinationNodeId!: string;

  @Column({
    name: 'quantity_shipped',
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantityShipped!: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: ShipmentStatus.IN_TRANSIT,
  })
  status!: ShipmentStatus;

  @Column({ name: 'shipped_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  shippedAt!: Date;

  @Column({ name: 'expected_delivery_date', type: 'timestamptz', nullable: true })
  expectedDeliveryDate!: Date | null;

  @Column({ name: 'actual_delivery_date', type: 'timestamptz', nullable: true })
  actualDeliveryDate!: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;

  // Relations
  @ManyToOne(() => BatchEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'source_node_id' })
  sourceNode!: NodeEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'destination_node_id' })
  destinationNode!: NodeEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: UserEntity;
}
