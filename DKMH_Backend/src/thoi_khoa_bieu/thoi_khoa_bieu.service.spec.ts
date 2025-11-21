import { Test, TestingModule } from '@nestjs/testing';
import { ThoiKhoaBieuService } from './thoi_khoa_bieu.service';

describe('ThoiKhoaBieuService', () => {
  let service: ThoiKhoaBieuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThoiKhoaBieuService],
    }).compile();

    service = module.get<ThoiKhoaBieuService>(ThoiKhoaBieuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
