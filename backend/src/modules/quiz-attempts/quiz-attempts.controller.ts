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
import { CreateQuizAttemptDto } from './dtos/create-quiz-attempt.dto';
import { UpdateQuizAttemptDto } from './dtos/update-quiz-attempt.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post()
  create(@Body() dto: CreateQuizAttemptDto) {
    return this.quizAttemptsService.create(dto);
  }

  @Get()
  findAll() {
    return this.quizAttemptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizAttemptsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizAttemptDto,
  ) {
    return this.quizAttemptsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizAttemptsService.remove(id);
  }
}
