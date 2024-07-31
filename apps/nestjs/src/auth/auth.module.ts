import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { DbService } from '../db/db.service';
import { TwoFactorAuthenticationService } from './2fa.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1w' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    DbService,
    TwoFactorAuthenticationService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
