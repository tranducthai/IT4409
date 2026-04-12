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
import { CreateQuizAnswerDto } from './dtos/create-quiz-answer.dto';
import { UpdateQuizAnswerDto } from './dtos/update-quiz-answer.dto';
import { QuizAnswersService } from './quiz-answers.service';

@Controller('quiz-answers')
export class QuizAnswersController {
  constructor(private readonly quizAnswersService: QuizAnswersService) {}

  @Post()
  create(@Body() dto: CreateQuizAnswerDto) {
    return this.quizAnswersService.create(dto);
  }

  @Get()
  findAll() {
    return this.quizAnswersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizAnswersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizAnswerDto,
  ) {
    return this.quizAnswersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizAnswersService.remove(id);
  }
}
