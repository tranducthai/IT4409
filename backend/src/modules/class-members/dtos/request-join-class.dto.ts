import { IsUUID } from 'class-validator';

export class RequestJoinClassDto {
    @IsUUID()
    class_id: string;
}
