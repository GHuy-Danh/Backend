import { Test, TestingModule } from '@nestjs/testing';
import { BuoiHocController } from './buoi_hoc.controller';
import { BuoiHocService } from './buoi_hoc.service';

describe('BuoiHocController', () => {
  let controller: BuoiHocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuoiHocController],
      providers: [BuoiHocService],
    }).compile();

    controller = module.get<BuoiHocController>(BuoiHocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
