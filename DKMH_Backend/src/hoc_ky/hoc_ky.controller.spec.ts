import { Test, TestingModule } from '@nestjs/testing';
import { HocKyController } from './hoc_ky.controller';
import { HocKyService } from './hoc_ky.service';

describe('HocKyController', () => {
  let controller: HocKyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HocKyController],
      providers: [HocKyService],
    }).compile();

    controller = module.get<HocKyController>(HocKyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
