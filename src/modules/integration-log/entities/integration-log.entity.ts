import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('integration_logs')
export class IntegrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  operation: string;

  @Column()
  provider: string;

  @Column({ type: 'jsonb' })
  requestPayload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  responsePayload: Record<string, unknown> | null;

  @Column()
  status: string;

  @Column({ type: 'integer', nullable: true })
  statusCode: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'integer', nullable: true })
  executionTimeMs: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
