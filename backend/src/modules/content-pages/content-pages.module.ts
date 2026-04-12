import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentPage } from './entities/content-page.entity';
import { ContentPagesController } from './content-pages.controller';
import { ContentPagesService } from './content-pages.service';
import { ContentPagesRepository } from './repositories/content-pages.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContentPage])],
  controllers: [ContentPagesController],
  providers: [ContentPagesService, ContentPagesRepository],
  exports: [ContentPagesService],
})
export class ContentPagesModule {}
