import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { TimelineEventType } from '../../../common/enums/timeline-event-type.enum';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('timeline_events')
export class TimelineEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({
    name: 'event_type',
    type: 'varchar',
    length: 30,
  })
  eventType!: TimelineEventType;

  @Column({ name: 'node_id', type: 'uuid', nullable: true })
  nodeId!: string | null;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ name: 'shipment_id', type: 'uuid', nullable: true })
  shipmentId!: string | null;

  @Column({
    name: 'quantity_delta',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
    transformer: numericTransformer,
  })
  quantityDelta!: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: any;

  // Relations
  @ManyToOne(() => BatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => NodeEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'node_id' })
  node!: NodeEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor!: UserEntity | null;
}
