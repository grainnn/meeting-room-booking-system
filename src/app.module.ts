import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Permission } from './user/entities/permission.entity';
import { Role } from './user/entities/role.entity';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { LoginGuard } from './login.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env'
    }),

    JwtModule.registerAsync(
      {
        inject: [ConfigService],
        global: true,
        useFactory(configService: ConfigService) {
          return {
            secret: configService.get('jwt_secret'),
            signOptions: {
              expiresIn: '60m'
            }
          }
        }
      }
    ),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'meeting_room_booking_system',
      synchronize: true,
      logging: true,
      entities: [User, Permission, Role],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugins: 'sha256_password'
      }
    }),
    UserModule,
    RedisModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: LoginGuard
  }]
})
export class AppModule {}
