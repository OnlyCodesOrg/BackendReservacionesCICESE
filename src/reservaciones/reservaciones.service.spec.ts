import { Test, TestingModule } from '@nestjs/testing';
import { ReservacionesService } from './reservaciones.service';

describe('ReservacionesService', () => {
  let service: ReservacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservacionesService],
    }).compile();

    service = module.get<ReservacionesService>(ReservacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
