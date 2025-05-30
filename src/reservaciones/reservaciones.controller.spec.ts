import { Test, TestingModule } from '@nestjs/testing';
import { ReservacionesController } from './reservaciones.controller';
import { ReservacionesService } from './reservaciones.service';

describe('ReservacionesController', () => {
  let controller: ReservacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservacionesController],
      providers: [ReservacionesService],
    }).compile();

    controller = module.get<ReservacionesController>(ReservacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
