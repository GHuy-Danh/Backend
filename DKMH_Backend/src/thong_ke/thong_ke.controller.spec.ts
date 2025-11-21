import { Test, TestingModule } from '@nestjs/testing';
import { ThongKeController } from './thong_ke.controller';
import { ThongKeService } from './thong_ke.service';

describe('ThongKeController', () => {
  let controller: ThongKeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThongKeController],
      providers: [ThongKeService],
    }).compile();

    controller = module.get<ThongKeController>(ThongKeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
