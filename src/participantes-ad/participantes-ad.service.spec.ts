import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantesAdService } from './participantes-ad.service';

describe('ParticipantesAdService', () => {
  let service: ParticipantesAdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantesAdService],
    }).compile();

    service = module.get<ParticipantesAdService>(ParticipantesAdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
