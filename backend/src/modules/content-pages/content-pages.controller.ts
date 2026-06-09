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
import { CreateContentPageDto } from './dtos/create-content-page.dto';
import { UpdateContentPageDto } from './dtos/update-content-page.dto';
import { ContentPagesService } from './content-pages.service';

@Controller('content-pages')
export class ContentPagesController {
  constructor(private readonly contentPagesService: ContentPagesService) {}

  @Post()
  create(@Body() dto: CreateContentPageDto) {
    return this.contentPagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.contentPagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contentPagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateContentPageDto,
  ) {
    return this.contentPagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contentPagesService.remove(id);
  }
}
