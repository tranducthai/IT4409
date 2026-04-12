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
import { CreateInstructorProfileDto } from './dtos/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dtos/update-instructor-profile.dto';
import { InstructorProfilesService } from './instructor-profiles.service';

@Controller('teacher-profiles')
export class InstructorProfilesController {
  constructor(
    private readonly instructorProfilesService: InstructorProfilesService,
  ) {}

  @Post()
  create(@Body() dto: CreateInstructorProfileDto) {
    return this.instructorProfilesService.create(dto);
  }

  @Get()
  findAll() {
    return this.instructorProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.instructorProfilesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInstructorProfileDto,
  ) {
    return this.instructorProfilesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.instructorProfilesService.remove(id);
  }
}
