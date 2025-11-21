import { Test, TestingModule } from '@nestjs/testing';
import { NhatKyHeThongController} from './nhatkyhethong.controller';
import { NhatKyHeThongService } from './nhatkyhethong.service';

describe('NhatKyHeThongController', () => {
  let controller: NhatKyHeThongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NhatKyHeThongController],
      providers: [NhatKyHeThongService],
    }).compile();

    controller = module.get<NhatKyHeThongController>(NhatKyHeThongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
