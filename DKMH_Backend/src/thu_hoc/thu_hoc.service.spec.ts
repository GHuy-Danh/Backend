import { Test, TestingModule } from '@nestjs/testing';
import { ThuHocService } from './thu_hoc.service';

describe('ThuHocService', () => {
  let service: ThuHocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThuHocService],
    }).compile();

    service = module.get<ThuHocService>(ThuHocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
