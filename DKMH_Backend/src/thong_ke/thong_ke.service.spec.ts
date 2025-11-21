import { Test, TestingModule } from '@nestjs/testing';
import { ThongKeService } from './thong_ke.service';

describe('ThongKeService', () => {
  let service: ThongKeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThongKeService],
    }).compile();

    service = module.get<ThongKeService>(ThongKeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
