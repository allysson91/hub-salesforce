import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class TokenRequestDto {
  @IsString()
  @IsIn(['client_credentials'])
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;
}
