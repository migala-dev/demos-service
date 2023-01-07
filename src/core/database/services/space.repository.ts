import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, UpdateResult } from 'typeorm';

import { Space } from '../entities/space.entity';

@Injectable()
export class SpaceRepository {
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

  public findOneById(spaceId: string) {
    return this.spacesRepository.findOneBy({ spaceId });
  }

  public updateNameAndDescriptionAndPercentages(
    spaceId: string,
    name?: string,
    description?: string,
    approvalPercentage?: number,
    participationPercentage?: number,
  ): Promise<UpdateResult> {
    const space: Space = this.spacesRepository.create({
      name,
      description,
      approvalPercentage,
      participationPercentage,
    });

    return this.spacesRepository.update(spaceId, space);
  }
}
