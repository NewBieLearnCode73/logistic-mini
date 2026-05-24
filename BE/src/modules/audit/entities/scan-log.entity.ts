import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEntity } from '../../batches/entities/batch.entity';
import { BatchQrCodeEntity } from '../../batches/entities/batch-qr-code.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('scan_logs')
export class ScanLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @Column({ name: 'qr_code_id', type: 'uuid', nullable: true })
  qrCodeId!: string | null;

  @Column({ name: 'scanned_by', type: 'uuid', nullable: true })
  scannedBy!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  latitude!: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  longitude!: number | null;

  @CreateDateColumn({ name: 'scanned_at', type: 'timestamptz' })
  scannedAt!: Date;

  // Relations
  @ManyToOne(() => BatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => BatchQrCodeEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'qr_code_id' })
  qrCode!: BatchQrCodeEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scanned_by' })
  scanner!: UserEntity | null;
}
