import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEntity } from '../../batches/entities/batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('inventory_adjustments')
export class InventoryAdjustmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({ name: 'node_id', type: 'uuid' })
  nodeId!: string;

  @Column({ name: 'adjustment_type', length: 20 })
  adjustmentType!: string; // LOSS_ROLLBACK | DAMAGE_WRITE_OFF | CORRECTION | RECONCILIATION

  @Column({
    name: 'qty_before',
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  qtyBefore!: number;

  @Column({
    name: 'qty_delta',
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  qtyDelta!: number;

  @Column({
    name: 'qty_after',
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  qtyAfter!: number;

  @Column({ name: 'reason', type: 'text' })
  reason!: string;

  @Column({ name: 'approved_by', type: 'uuid' })
  approvedBy!: string; // Admin 1

  @Column({ name: 'second_approver', type: 'uuid', nullable: true })
  secondApprover!: string | null; // Admin 2

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId!: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType!: string | null; // incident_reports | shipments

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => BatchEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'node_id' })
  node!: NodeEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approved_by' })
  approver!: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'second_approver' })
  secondApproverUser!: UserEntity | null;
}
