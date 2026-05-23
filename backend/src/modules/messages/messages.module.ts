import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Class } from '../classes/entities/class.entity';
import { Discussion } from '../discussions/entities/discussion.entity';
import { Message } from './entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './repositories/messages.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Message, ClassMember, Class, Discussion])],
    controllers: [MessagesController],
    providers: [MessagesService, MessagesRepository],
    exports: [MessagesService],
})
export class MessagesModule { }
