import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VideoSession } from '../../video-sessions/entities/video-session.entity';
import { VideoParticipantRole } from '../enums/video-participant-role.enum';

@Entity('video_participants')
@Index(['video_session_id', 'user_id'], { unique: true })
export class VideoParticipant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    video_session_id: string;

    @ManyToOne(() => VideoSession, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_session_id' })
    video_session: VideoSession;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: VideoParticipantRole })
    role: VideoParticipantRole;

    @CreateDateColumn({ type: 'timestamp' })
    joined_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    left_at: Date | null;
}
