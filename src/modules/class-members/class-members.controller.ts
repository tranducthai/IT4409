import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classMembersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassMemberDto,
  ) {
    return this.classMembersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classMembersService.remove(id);
  }
}
