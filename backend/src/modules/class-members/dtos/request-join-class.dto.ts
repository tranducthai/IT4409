import { IsString } from 'class-validator';

export class RequestJoinClassDto {
    @IsString()
    join_code: string;
}
