import { Controller, Get, Param } from '@nestjs/common';
import { FindAddressDto } from './dto/find-address.dto';
import { CepService } from './cep.service';

@Controller('cep')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(':cep')
  findAddress(@Param() params: FindAddressDto) {
    return this.cepService.findAddress(params.cep);
  }
}
