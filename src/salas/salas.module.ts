import { Module } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

@Module({
  imports: [],
  controllers: [SalasController],
  providers: [SalasService],
})
export class SalasModule {}
