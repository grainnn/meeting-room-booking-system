import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  HttpStatus,
  UnauthorizedException,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';

import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin } from 'src/custom.decorator';
import { JwtUserData } from 'src/typings';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  // 大量使用swagger会导致controller看起来比较混乱

  @ApiTags('注册')
  // 用户注册发送验证码
  @ApiOperation({
    summary: '用户注册发送验证码'
  })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '接收验证码使用的邮箱',
    required: true,
    example: 'haha@163.com'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码发送成功',
    type: String,
    example: 200
  })
  @Get('sendCaptcha')
  async sendCaptcha(@Query('email') email: string) {
    const code = Math.random().toString().slice(2, 8);

    const email_key = `captcha_${email}`;

    const exist_code = await this.redisService.get(email_key);
    if (exist_code) {
      return '验证码已发送，请不要重复发送';
    }

    await this.redisService.set(email_key, code, 5 * 60);

    await this.emailService.sendMail({
      to: email,
      subject: '会议室系统-注册',
      html: `<p>您的验证码是${code}</p>`
    });

    return '发送成功';
  }

  @ApiTags('注册')
  // 使用验证码注册账号
  @ApiOperation({
    summary: '使用验证码注册账号'
  })
  @ApiBody({})
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.login(loginDto, false);

    user.accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '60m'
      }
    );

    user.refreshToken = this.jwtService.sign(
      {
        userId: user.id
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d'
      }
    );

    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('adminLogin')
  async adminLogin(@Body() loginDto: LoginDto) {
    const user = await this.userService.login(loginDto, true);

    return user;
  }

  @Get('refresh_token')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const data: JwtUserData = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign(
        {
          userId: user?.id,
          username: user?.name
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '60m'
        }
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user?.id
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d'
        }
      );

      return {
        access_token,
        refresh_token
      };
    } catch (err: any) {
      console.log(err);
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
  }

  @RequireLogin()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @RequireLogin()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiParam({
    name: 'id',
    description: '用户id',
    required: true,
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'id不合法'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (+id < 1) {
      throw new UnauthorizedException();
    }

    return this.userService.findUserById(+id, false);
  }

  @RequireLogin()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    return this.userService.update(+id, updateDto);
  }

  @RequireLogin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
