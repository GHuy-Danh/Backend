import { Test, TestingModule } from '@nestjs/testing';
import { ThoiKhoaBieuController } from './thoi_khoa_bieu.controller';
import { ThoiKhoaBieuService } from './thoi_khoa_bieu.service';

describe('ThoiKhoaBieuController', () => {
  let controller: ThoiKhoaBieuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThoiKhoaBieuController],
      providers: [ThoiKhoaBieuService],
    }).compile();

    controller = module.get<ThoiKhoaBieuController>(ThoiKhoaBieuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
