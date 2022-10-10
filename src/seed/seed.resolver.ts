import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}


  @Mutation(() => Boolean, {name: 'executeSeed', description: 'Execute the contructor of the seed service that will seed the database'})
  async executeSeed(): Promise<boolean> {
    return await this.seedService.executeSeed();
  }

}
