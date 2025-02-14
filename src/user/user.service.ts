import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/tools';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  private logger = new Logger();
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  async register(registerDto: RegisterDto) {
    // const captcha = await this.redisService.get(`captcha_${registerDto.email}`);

    // if (!captcha) {
    //   throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    // }

    // if (registerDto.captcha !== captcha) {
    //   throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    // }

    const foundUser = await this.userRepository.findOneBy({
      username: registerDto.username
    });

    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = registerDto.username;
    newUser.email = registerDto.email;
    newUser.password = md5(registerDto.password);

    try {
      await this.userRepository.save(newUser);
    } catch (err) {
      this.logger.error(err, UserService);
      return '注册失败';
    }
  }

  async login(loginDto: LoginDto, isAdmin: boolean): Promise<User> {
    const user = (await this.userRepository.findOne({
      where: {
        username: loginDto.username,
        isAdmin
      },
      relations: ['roles', 'roles.permissions']
    })) as LoginDto;

    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginDto.password)) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }

    return user as User;
  }

  // async adminLogin(loginDto: LoginDto, isAdmin: )

  findAll() {
    return this.userRepository.find();
  }

  findUserById(id: number, isAdmin: boolean): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
        isAdmin
      }
    });
  }

  update(id: number, updateDto: UpdateDto) {
    console.log(updateDto);
    return `This action updates a #${id} user`;
  }

  upload() {}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
