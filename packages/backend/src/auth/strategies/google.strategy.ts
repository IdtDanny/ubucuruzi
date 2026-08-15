import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private config: ConfigService) {
    const clientId = config.get<string>('google.clientId');
    const clientSecret = config.get<string>('google.clientSecret');
    const callbackUrl = config.get<string>('google.callbackUrl');
    if (!clientId || !clientSecret || !callbackUrl) {
      throw new Error('Google OAuth credentials missing');
    }
    super({
      clientId,
      clientSecret,
      callbackUrl,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value || null,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}