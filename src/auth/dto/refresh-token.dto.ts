import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'ID del usuario que solicita el refresh',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Token de refresco para obtener un nuevo token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
