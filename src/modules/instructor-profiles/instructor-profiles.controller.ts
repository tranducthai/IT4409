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
import { CreateInstructorProfileDto } from './dtos/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dtos/update-instructor-profile.dto';
import { InstructorProfilesService } from './instructor-profiles.service';

@Controller('instructor-profiles')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructorProfilesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstructorProfileDto,
  ) {
    return this.instructorProfilesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instructorProfilesService.remove(id);
  }
}
