import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Space } from '../entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
  ) {}

  public create(
    userId: string,
    name: string,
    description: string,
    approvalPercentage: number,
    participationPercentage: number,
  ): Promise<Space> {
    const spaceToCreate: Space = new Space();
    spaceToCreate.name = name;
    spaceToCreate.description = description;
    spaceToCreate.approvalPercentage = approvalPercentage;
    spaceToCreate.participationPercentage = participationPercentage;
    spaceToCreate.ownerId = userId;

    return this.spacesRepository.save(spaceToCreate);
  }
}
