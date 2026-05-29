import { IsNotEmpty, IsString } from 'class-validator';

export class FindAddressDto {
  @IsString()
  @IsNotEmpty()
  cep: string;
}
