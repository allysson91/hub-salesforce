import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TokenRequestDto {
  @IsString()
  @IsIn(['client_credentials'])
  @MaxLength(32)
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  client_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  client_secret: string;
}
