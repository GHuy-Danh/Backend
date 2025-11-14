import { Test, TestingModule } from '@nestjs/testing';
import { PhongHocService } from './phong_hoc.service';

describe('PhongHocService', () => {
  let service: PhongHocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhongHocService],
    }).compile();

    service = module.get<PhongHocService>(PhongHocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
