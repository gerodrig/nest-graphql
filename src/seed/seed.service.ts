import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';

@Injectable()
export class SeedService {
  private isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
  ) {
    this.isProduction =
      this.configService.get('STATE') === ('production' || 'prod');
  }

  async executeSeed(): Promise<boolean> {
    if (this.isProduction)
      throw new UnauthorizedException(
        'You are not allowed to seed the database in production mode',
      );

    //clean the database. DELETE ALL RECORDS FROM ALL TABLES.
    await this.deleteDatabase();
    //Create users
    const user = await this.loadUsers();

    //Create items
    await this.loadItems(user);

    //Create lists\
    const list = await this.loadLists( user );

    //Create list items
    const items = await this.itemsService.findAll(user.id, { limit: 15, offset: 0 },{});
    await this.loadListsItems(list, items);

    return true;
  }

  async deleteDatabase() {
    //delete list items
    await this.listItemRepository.createQueryBuilder().delete().where({}).execute();
    //delete lists
    await this.listRepository.createQueryBuilder().delete().where({}).execute();
    //delete items first
    await this.itemRepository.createQueryBuilder().delete().where({}).execute();
    //delete users
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemsPromises = [];

    for (const item of SEED_ITEMS) {
      itemsPromises.push(this.itemsService.create(item, user));
    }

    await Promise.all(itemsPromises);
  }

  async loadLists(user: User): Promise<List> {
    const lists = [];

    for (const list of SEED_LISTS) {
      lists.push(await this.listsService.create(list, user));
    }

    return lists[0];
  }

  async loadListsItems(list: List, items: Item[]): Promise<void> {
    
    for (const item of items) {
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
