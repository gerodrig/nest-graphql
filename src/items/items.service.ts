import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { UpdateItemInput, CreateItemInput } from './dto/inputs';

import { User } from 'src/users/entities/user.entity';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save(newItem);
  }

  async findAll(
    userId: string,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    //?Using query builder
    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"userId" = :userId', { userId });

    if (search) {
      console.log(search);
      //transform search to lowercase
      queryBuilder.andWhere('LOWER(name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();

    //? Using find
    // return await this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {user: {
    //     id: userId
    //   },
    //   name: Like(`%${search.toLowerCase()}%`)
    // }
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    //Check by id and user
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!item) throw new NotFoundException(`Item #${id} not found`);

    //item.user = user;

    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    //? const item = await this.itemsRepository.preload({...updateItemInput, user});
    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item #${id} not found`);

    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);

    return await this.itemsRepository.remove(item);
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
