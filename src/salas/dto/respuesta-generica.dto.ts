import { ApiProperty } from '@nestjs/swagger';

export class respuestaGenerica {
  @ApiProperty({ description: 'Un mensaje con el error encontrado o un ok' })
  message: 'ok';

  @ApiProperty({ description: 'el resultado o null' })
  data: any;
}
