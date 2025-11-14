import { Test, TestingModule } from '@nestjs/testing';
import { ThuHocController } from './thu_hoc.controller';
import { ThuHocService } from './thu_hoc.service';

describe('ThuHocController', () => {
  let controller: ThuHocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThuHocController],
      providers: [ThuHocService],
    }).compile();

    controller = module.get<ThuHocController>(ThuHocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
