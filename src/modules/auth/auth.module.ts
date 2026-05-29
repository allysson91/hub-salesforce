import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { OauthGuard } from './oauth.guard';
import { OauthTokenService } from './oauth-token.service';
import { SalesforceAuthService } from './salesforce-auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    SalesforceAuthService,
    OauthTokenService,
    {
      provide: APP_GUARD,
      useClass: OauthGuard,
    },
  ],
  exports: [SalesforceAuthService, OauthTokenService],
})
export class AuthModule {}
