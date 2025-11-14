import { Test, TestingModule } from '@nestjs/testing';
import { HocKyService } from './hoc_ky.service';

describe('HocKyService', () => {
  let service: HocKyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HocKyService],
    }).compile();

    service = module.get<HocKyService>(HocKyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
