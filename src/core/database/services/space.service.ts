import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Space } from '../entities/space.entity';
import { SpaceModel } from '../../../modules/spaces/spaces/models/space.model';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
  ) {}

  public create(newSpace: SpaceModel, userId: string): Promise<Space> {
    const spaceToCreate: Space = new Space();
    spaceToCreate.name = newSpace.name;
    spaceToCreate.description = newSpace.description;
    spaceToCreate.approvalPercentage = newSpace.approvalPercentage;
    spaceToCreate.participationPercentage = newSpace.participationPercentage;
    spaceToCreate.ownerId = userId;

    return this.spacesRepository.save(spaceToCreate);
  }
}
