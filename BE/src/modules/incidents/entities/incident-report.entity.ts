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
import { ShipmentEntity } from '../../shipments/entities/shipment.entity';
import { BatchEntity } from '../../batches/entities/batch.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('incident_reports')
export class IncidentReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'incident_code', length: 50, unique: true })
  incidentCode!: string;

  @Column({ name: 'shipment_id', type: 'uuid' })
  shipmentId!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({ name: 'incident_type', length: 20 })
  incidentType!: string; // OVERDUE | MISSING | DAMAGED | FRAUD | OTHER

  @Column({ name: 'status', length: 20, default: 'OPEN' })
  status!: string; // OPEN | IN_PROGRESS | RESOLVED | CLOSED

  @Column({ name: 'priority', length: 10, default: 'MEDIUM' })
  priority!: string; // LOW | MEDIUM | HIGH | CRITICAL

  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy!: string;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'resolution', type: 'text', nullable: true })
  resolution!: string | null;

  @Column({ name: 'resolution_type', type: 'varchar', length: 50, nullable: true })
  resolutionType!: string | null; // FOUND | LOSS_CONFIRMED | CANCELLED | CORRECTED

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'first_approved_by', type: 'uuid', nullable: true })
  firstApprovedBy!: string | null;

  @Column({ name: 'evidence_jsonb', type: 'jsonb', nullable: true })
  evidenceJsonb!: any;

  @CreateDateColumn({ name: 'opened_at', type: 'timestamptz' })
  openedAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;

  // Relations
  @ManyToOne(() => ShipmentEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shipment_id' })
  shipment!: ShipmentEntity;

  @ManyToOne(() => BatchEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reported_by' })
  reporter!: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approved_by' })
  approver!: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'first_approved_by' })
  firstApprover!: UserEntity | null;
}
