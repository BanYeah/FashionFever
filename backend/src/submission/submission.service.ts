import {
  Injectable,
  BadRequestException, // 400
  NotFoundException, // 404
  GoneException, // 410
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { R2Service } from 'src/common/r2/r2.service';

import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from './entities/submission.entity';

import { CreateSubmissionDto } from './dto/createSubmission.dto';
import { PurgeCacheUtil } from 'src/common/utils/purge-cache.util';

@Injectable()
export class SubmissionService {
  constructor(
    private dataSource: DataSource,
    private readonly r2Service: R2Service,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Submission) private submRepo: Repository<Submission>,
  ) {}

  async createSubmission(
    themeId: string,
    userId: string,
    dto: CreateSubmissionDto,
    contentFiles: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const deletedFiles: Set<string> = new Set<string>();
    const uploadedFiles: string[] = [];

    try {
      const user = await this.userRepo.findOne({
        where: { user_id: userId },
      });
      if (!user) throw new NotFoundException();

      const schedule = await this.scheduleRepo.findOne({
        where: { theme_id: themeId },
      });
      if (!schedule) throw new NotFoundException();
      if (schedule.status !== 'ENROLLING') throw new GoneException();

      /* 기존 제출 내역 삭제 */
      const submissions = await queryRunner.manager.find(Submission, {
        where: {
          theme_id: themeId,
          user_id: userId,
        },
        select: ['content_url'],
      });

      submissions.forEach((sub) => {
        if (sub.content_url) deletedFiles.add(sub.content_url);
      });

      await queryRunner.manager.delete(Submission, {
        theme_id: themeId,
        user_id: userId,
      });

      /* 제출 */
      for (const sub of dto.contents) {
        if (sub.content_file_order !== null) {
          const contentUrl = await this.r2Service.uploadImage(
            contentFiles[sub.content_file_order],
            `submission/${userId}`,
          );
          uploadedFiles.push(contentUrl);

          await queryRunner.manager.save(Submission, {
            theme_id: themeId,
            user_id: userId,
            content_url: contentUrl,
          });
        } else if (sub.content_url !== null) {
          deletedFiles.delete(sub.content_url);

          await queryRunner.manager.save(Submission, {
            theme_id: themeId,
            user_id: userId,
            content_url: sub.content_url,
          });
        } else throw new BadRequestException('제출 이미지는 필수예요!');
      }

      await queryRunner.commitTransaction();

      this.r2Service.deleteImages(Array.from(deletedFiles)).catch(() => {
        console.log(
          `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(Array.from(deletedFiles))}`,
        );
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (uploadedFiles.length > 0)
        this.r2Service.deleteImages(uploadedFiles).catch(() => {
          console.log(
            `[R2_ROLLBACK_ERROR] Failed to delete orphaned files: ${JSON.stringify(uploadedFiles)}`,
          );
        });

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getSubmissions(themeId: string, userId: string) {
    const user = await this.userRepo.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException();

    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();

    const submissions = await this.submRepo.find({
      where: { theme_id: themeId, user_id: userId },
      select: ['content_url'],
    });

    return {
      data: {
        content_urls: submissions
          ? submissions.map((sub) => sub.content_url)
          : [],
      },
    };
  }

  async patchSubmission(fileUrl: string, file: Express.Multer.File) {
    const submission = await this.submRepo.findOne({
      where: { content_url: fileUrl },
      relations: ['schedule'],
    });
    if (!submission || !submission.schedule) throw new NotFoundException();
    if (submission.schedule.status !== 'REVIEWING') throw new GoneException();

    const userId = submission.user_id;
    const contentUrl = await this.r2Service.uploadImage(
      file,
      `submission/${userId}`,
    );
    await this.submRepo.update(
      { submission_id: submission.submission_id },
      { content_url: contentUrl },
    );
    await this.r2Service.deleteImages([fileUrl]);
  }
}
