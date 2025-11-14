import { Test, TestingModule } from '@nestjs/testing';
import { GiangVienController } from './giang_vien.controller';
import { GiangVienService } from './giang_vien.service';

describe('GiangVienController', () => {
  let controller: GiangVienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiangVienController],
      providers: [GiangVienService],
    }).compile();

    controller = module.get<GiangVienController>(GiangVienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
