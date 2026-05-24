import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ShipmentEntity } from '../../shipments/entities/shipment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { IncidentReportEntity } from './incident-report.entity';

@Entity('shipment_issues')
export class ShipmentIssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shipment_id', type: 'uuid' })
  shipmentId!: string;

  @Column({ name: 'issue_type', length: 20 })
  issueType!: string; // OVERDUE | MISSING | WRONG_NODE | UNACKNOWLEDGED | DAMAGED | FRAUD

  @Column({ name: 'severity', length: 10, default: 'MEDIUM' })
  severity!: string; // LOW | MEDIUM | HIGH | CRITICAL

  @CreateDateColumn({ name: 'detected_at', type: 'timestamptz' })
  detectedAt!: Date;

  @Column({ name: 'detected_by', length: 50 })
  detectedBy!: string; // SYSTEM_CRON or USER:{userId}

  @Column({ name: 'reported_by', type: 'uuid', nullable: true })
  reportedBy!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved!: boolean;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'incident_report_id', type: 'uuid', nullable: true })
  incidentReportId!: string | null;

  // Relations
  @ManyToOne(() => ShipmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment!: ShipmentEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reported_by' })
  reporter!: UserEntity | null;

  @ManyToOne(() => IncidentReportEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'incident_report_id' })
  incidentReport!: IncidentReportEntity | null;
}
