import { Test, TestingModule } from '@nestjs/testing';
import { BuoiHocService } from './buoi_hoc.service';

describe('BuoiHocService', () => {
  let service: BuoiHocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuoiHocService],
    }).compile();

    service = module.get<BuoiHocService>(BuoiHocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
