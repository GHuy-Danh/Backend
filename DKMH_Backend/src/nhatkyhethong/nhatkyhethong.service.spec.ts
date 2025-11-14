import { Test, TestingModule } from '@nestjs/testing';
import { NhatKyHeThongService } from './nhatkyhethong.service';

describe('NhatKyHeThongService', () => {
  let service: NhatKyHeThongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NhatKyHeThongService],
    }).compile();

    service = module.get<NhatKyHeThongService>(NhatKyHeThongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
