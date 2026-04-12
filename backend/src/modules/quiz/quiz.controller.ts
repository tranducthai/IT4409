import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';
import { QuizService } from './quiz.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':quizId')
  getQuiz(@Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.quizService.getQuizForTaking(quizId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':quizId/start')
  start(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.quizService.startAttempt(quizId, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':quizId/submit')
  submit(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: AuthedRequest,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submitAttempt(quizId, req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':quizId/attempts/me')
  listMyAttempts(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.quizService.listMyAttempts(quizId, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('attempts/:attemptId')
  getAttemptResult(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.quizService.getAttemptResult(attemptId, req.user.sub);
  }
}
