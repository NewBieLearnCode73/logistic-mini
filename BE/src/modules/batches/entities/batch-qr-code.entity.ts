import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('batch_qr_codes')
export class BatchQrCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id', type: 'uuid', unique: true })
  batchId!: string;

  @Column({ name: 'qr_data', type: 'text' })
  qrData!: string;

  @Column({ name: 'svg_data', type: 'text', nullable: true })
  svgData!: string | null;

  @Column({ name: 'qr_image_url', type: 'text', nullable: true })
  qrImageUrl!: string | null;

  @CreateDateColumn({ name: 'generated_at', type: 'timestamptz' })
  generatedAt!: Date;

  @Column({ name: 'generated_by', type: 'uuid' })
  generatedBy!: string;

  // Relations
  @OneToOne(() => BatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'generated_by' })
  generator!: UserEntity;
}
