import { Test, TestingModule } from '@nestjs/testing';
import { PhongHocController } from './phong_hoc.controller';
import { PhongHocService } from './phong_hoc.service';

describe('PhongHocController', () => {
  let controller: PhongHocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhongHocController],
      providers: [PhongHocService],
    }).compile();

    controller = module.get<PhongHocController>(PhongHocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
