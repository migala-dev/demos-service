import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserDevice } from '../entities/user-device.entity';

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private readonly userDevicesRepository: Repository<UserDevice>,
  ) {}

  public async createOrUpdate(
    userId: string,
    deviceId: string,
  ): Promise<UserDevice> {
    let userDevice: UserDevice = await this.userDevicesRepository.findOneBy({
      userId: userId,
    });
    if (!!userDevice) {
      userDevice.deviceId = deviceId;
    } else {
      userDevice = new UserDevice();
      userDevice.userId = userId;
      userDevice.deviceId = deviceId;
    }
    return this.userDevicesRepository.save(userDevice);
  }
}
