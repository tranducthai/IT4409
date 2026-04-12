import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateClassMemberDto } from './dtos/create-class-member.dto';
import { UpdateClassMemberDto } from './dtos/update-class-member.dto';
import { ClassMembersService } from './class-members.service';

@Controller('class-members')
export class ClassMembersController {
  constructor(private readonly classMembersService: ClassMembersService) {}

  @Post()
  create(@Body() dto: CreateClassMemberDto) {
    return this.classMembersService.create(dto);
  }

  @Get()
  findAll() {
    return this.classMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassMemberDto,
  ) {
    return this.classMembersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.remove(id);
  }
}
