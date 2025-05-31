import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantesAdController } from './participantes-ad.controller';
import { ParticipantesAdService } from './participantes-ad.service';

describe('ParticipantesAdController', () => {
  let controller: ParticipantesAdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantesAdController],
      providers: [ParticipantesAdService],
    }).compile();

    controller = module.get<ParticipantesAdController>(
      ParticipantesAdController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
