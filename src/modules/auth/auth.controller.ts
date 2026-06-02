import { Body, Controller, Post } from '@nestjs/common';
import { SkipResponseWrap } from '../../common/decorators/skip-response-wrap.decorator';
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
  @SkipResponseWrap()
  @Post('token')
  createToken(@Body() body: TokenRequestDto): AccessTokenResponse {
    return this.oauthTokenService.issueClientCredentialsToken(
      body.client_id,
      body.client_secret,
    );
  }
}
