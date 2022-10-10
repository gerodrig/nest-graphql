import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';


import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll(roles: ValidRoles[], paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<User[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    

    if (roles.length === 0) return this.usersRepository.find({
      //THIS IS NOT NEEDED BECAUSE LAZY LOADING IS ENABLED IN THE USER ENTITY IN MANY TO ONE RELATIONSHIP
      // relations: {
      //   lastUpdatedBy: true,
      // }
    });

    // if length is greater than 0, then we need to filter the results based on the roles
    
    const queryBuilder =  this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      // .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      // .setParameter('roles', roles)

    if (search) {
      //search by email or first name or last name
      queryBuilder.andWhere('email ILIKE :search OR "firstName" ILIKE :search OR "lastName" ILIKE :search', { search: `%${search}%` })
    }

    return await queryBuilder.getMany();

  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDBError({
        code: 'error-001',
        detail: `${email} not found`,
      });
      // throw new NotFoundException(`${ email } not found`);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleDBError({
        code: 'error-001',
        detail: `${id} not found`,
      });
      // throw new NotFoundException(`${ email } not found`);
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput, updatedBy: User): Promise<User> {
    
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });
      user.lastUpdatedBy = updatedBy;

      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    //update the user's status to isActive = false
    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = adminUser;

    return await this.usersRepository.save(userToBlock);
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    if (error.code === 'error-001') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Please check server logs for more info',
    );
  }
}
