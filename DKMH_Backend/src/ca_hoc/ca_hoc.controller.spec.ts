import { Test, TestingModule } from '@nestjs/testing';
import { CaHocController } from './ca_hoc.controller';
import { CaHocService } from './ca_hoc.service';

describe('CaHocController', () => {
  let controller: CaHocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaHocController],
      providers: [CaHocService],
    }).compile();

    controller = module.get<CaHocController>(CaHocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
