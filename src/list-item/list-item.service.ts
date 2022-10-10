import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ListItem } from './entities/list-item.entity';
import { List } from '../lists/entities/list.entity';

import { PaginationArgs, SearchArgs } from '../common/dto/args';

import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { listId, itemId, ...rest } = createListItemInput;

    const newListItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.listItemRepository.save(newListItem);

    //we save and then we return the new list item with the id this is to avoid nullable messages in the graphql schema
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"listId" = :listId', { listId: list.id });

    if (search) {
      queryBuilder.andWhere('"name" ILIKE :search', { search: `%${search}%` });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemRepository.findOneBy({id});

    if(!listItem) throw new NotFoundException(`List Item with id: ${id} not found`);

    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {

    const { listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemRepository.createQueryBuilder().update().set(rest).where('"id" = :id', { id });

    if (listId) {
      queryBuilder.set({ list: { id: listId } });
    }
    if (itemId) {
      queryBuilder.set({ item: { id: itemId } });
    }

    await queryBuilder.execute(); 

    return await this.findOne(id);

  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async count(list: List): Promise<number> {
    return await this.listItemRepository.count({
      where: {
        list: { id: list.id },
      },
    });
  }
}
