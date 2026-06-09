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
import { CreateStudentProfileDto } from './dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dtos/update-student-profile.dto';
import { StudentProfilesService } from './student-profiles.service';

@Controller('student-profiles')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Post()
  create(@Body() dto: CreateStudentProfileDto) {
    return this.studentProfilesService.create(dto);
  }

  @Get()
  findAll() {
    return this.studentProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentProfilesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentProfilesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentProfilesService.remove(id);
  }
}
