import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard.js';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
})
export class AuthModule {}