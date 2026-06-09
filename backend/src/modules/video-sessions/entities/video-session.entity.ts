import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { VideoParticipant } from '../../video-participants/entities/video-participant.entity';

@Entity('video_sessions')
export class VideoSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @Column({ type: 'uuid' })
    host_id: string;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'host_id' })
    host: User;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', nullable: true })
    room_url: string | null;

    @Column({ type: 'timestamp', nullable: true })
    started_at: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    ended_at: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => VideoParticipant, (p) => p.video_session)
    participants: VideoParticipant[];
}
