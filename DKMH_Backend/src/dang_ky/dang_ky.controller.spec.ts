import { Test, TestingModule } from '@nestjs/testing';
import { DangKyController } from './dang_ky.controller';
import { DangKyService } from './dang_ky.service';

describe('DangKyController', () => {
  let controller: DangKyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DangKyController],
      providers: [DangKyService],
    }).compile();

    controller = module.get<DangKyController>(DangKyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
