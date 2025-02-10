import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Get('sendCaptcha')
  async sendCaptcha(@Query('email') email: string) {
    const code = Math.random().toString().slice(2, 8)
    await this.redisService.set(`captcha_${email}`, code, 5 * 60)

    await this.emailService.sendMail({
      to: email,
      subject: '会议室系统-注册',
      html: `<p>您的验证码是${code}</p>`
    })

    return '发送成功'
  }

  @Post('register')
  register(@Body() RegisterUserDto: RegisterUserDto) {
    console.log(RegisterUserDto);
    return this.userService.register(RegisterUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
