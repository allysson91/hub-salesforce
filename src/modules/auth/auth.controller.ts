import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { Public } from './decorators/public.decorator';
import { TokenRequestDto } from './dto/token-request.dto';
import {
  AccessTokenResponse,
  OauthTokenService,
} from './oauth-token.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly oauthTokenService: OauthTokenService) {}

  @Public()
  @Post('token')
  createToken(
    @Body() body: TokenRequestDto,
  ): ApiResponse<AccessTokenResponse> {
    return {
      success: true,
      message: 'Token gerado com sucesso.',
      data: this.oauthTokenService.issueClientCredentialsToken(
        body.client_id,
        body.client_secret,
      ),
    };
  }
}
