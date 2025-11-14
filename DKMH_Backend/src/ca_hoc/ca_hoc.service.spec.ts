import { Test, TestingModule } from '@nestjs/testing';
import { CaHocService } from './ca_hoc.service';

describe('CaHocService', () => {
  let service: CaHocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaHocService],
    }).compile();

    service = module.get<CaHocService>(CaHocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
