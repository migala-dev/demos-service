import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, InsertResult, UpdateResult, Like } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public findOneByCognitoId(cognitoId: string): Promise<User> {
    return this.usersRepository.findOneBy({ cognitoId });
  }

  public findOneByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.usersRepository.findOneBy({ phoneNumber: Like(`%${this.getPhoneWithoutExtension(phoneNumber)}`) });
  }

  public create(phoneNumber: string, cognitoId: string): Promise<InsertResult> {
    const user = this.usersRepository.create({ phoneNumber, cognitoId  });
    return this.usersRepository.insert(user);
  }

  public updateCognitoId(userId: string, cognitoId: string): Promise<UpdateResult> {
    const user = this.usersRepository.create({ cognitoId  });
    return this.usersRepository.update(userId, user);
  }

  private getPhoneWithoutExtension(phoneNumber: string): string {
    return phoneNumber.substr(phoneNumber.length - 10);
  }

  public saveUser({ ...user }: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  public updatePictureKey(userId: string, profilePictureKey: string): Promise<UpdateResult> {
    const user = this.usersRepository.create({ profilePictureKey });
    return this.usersRepository.update(userId, user);
  }
}