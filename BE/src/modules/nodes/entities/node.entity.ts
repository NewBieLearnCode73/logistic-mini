import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';
import { NodeType } from '../../../common/enums/node-type.enum';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

@Entity('nodes')
export class NodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name', length: 200 })
  name!: string;

  @Column({
    name: 'node_type',
    type: 'varchar',
    length: 20,
  })
  nodeType!: NodeType;

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string | null;

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

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;
}
