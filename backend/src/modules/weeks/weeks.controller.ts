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
import { CreateWeekDto } from './dtos/create-week.dto';
import { UpdateWeekDto } from './dtos/update-week.dto';
import { WeeksService } from './weeks.service';

@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  @Post()
  create(@Body() dto: CreateWeekDto) {
    return this.weeksService.create(dto);
  }

  @Get()
  findAll() {
    return this.weeksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.weeksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWeekDto,
  ) {
    return this.weeksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.weeksService.remove(id);
  }
}
