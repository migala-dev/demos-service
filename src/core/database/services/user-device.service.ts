import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserDevice } from '../entities/user-device.entity';

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private readonly userDevicesRepository: Repository<UserDevice>
  ) {}

  public createOrUpdate(userId: string, deviceId: string): Promise<UserDevice> {
    const userDeviceToCreateOrUpdate: UserDevice = new UserDevice() ;
    userDeviceToCreateOrUpdate.userId = userId;
    userDeviceToCreateOrUpdate.deviceId = deviceId;

    return this.userDevicesRepository.save(userDeviceToCreateOrUpdate);
  }
}
