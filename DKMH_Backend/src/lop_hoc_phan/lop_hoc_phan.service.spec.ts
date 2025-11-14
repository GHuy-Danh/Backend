import { Test, TestingModule } from '@nestjs/testing';
import { LopHocPhanService } from './lop_hoc_phan.service';

describe('LopHocPhanService', () => {
  let service: LopHocPhanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LopHocPhanService],
    }).compile();

    service = module.get<LopHocPhanService>(LopHocPhanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
