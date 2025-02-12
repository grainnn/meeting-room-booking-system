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
	UnauthorizedException
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';

import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
	private emailService: EmailService;
	

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
    const code = Math.random().toString().slice(2, 8)

    const email_key = `captcha_${email}`

    const exist_code = await this.redisService.get(email_key)
    if (exist_code) {
      return '验证码已发送，请不要重复发送'
    }

    await this.redisService.set(email_key, code, 5 * 60)

    await this.emailService.sendMail({
      to: email,
      subject: '会议室系统-注册',
      html: `<p>您的验证码是${code}</p>`
    })

    return '发送成功'
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

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		await this.userService.login(loginDto, false)

		return '登录成功'
	}
	
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
			throw new UnauthorizedException()
		}

    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    return this.userService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
