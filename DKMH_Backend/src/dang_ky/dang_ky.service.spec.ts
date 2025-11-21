import { Test, TestingModule } from '@nestjs/testing';
import { DangKyService } from './dang_ky.service';

describe('DangKyService', () => {
  let service: DangKyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DangKyService],
    }).compile();

    service = module.get<DangKyService>(DangKyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
