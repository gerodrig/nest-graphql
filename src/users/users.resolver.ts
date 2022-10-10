import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { ItemsService } from 'src/items/items.service';
import { ListsService } from 'src/lists/lists.service';

import { User } from './entities/user.entity';
import { Item } from 'src/items/entities/item.entity';

import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';

import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { List } from 'src/lists/entities/list.entity';

@Resolver(() => User)
@UseGuards( JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService, private readonly itemsService: ItemsService, private readonly listsService: ListsService) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    @Args() validRoles: ValidRolesArgs,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<User[]> {

    return this.usersService.findAll( validRoles.roles, paginationArgs, searchArgs);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User
    ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, {name: 'updateUser'})
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.superadmin]) user: User
    ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User)
  blockUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser([ValidRoles.superadmin]) user: User
    ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField(() => Int, {name: 'itemCount'})
  async itemCount(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) adminUser: User,
    @Parent() user: User
  ): Promise<number> {
    return this.itemsService.itemCountByUser(user);

  }
  @ResolveField(() => [Item], {name: 'items'})
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAll(user.id, paginationArgs, searchArgs);
  }

  //list count resolver
  @ResolveField(() => Int, {name: 'listCount'})
  async listCount(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<number> {
    return this.listsService.listCountByUser(user);
  }

  //get user lists
  // TODO: getLIstbyuser
  @ResolveField(() => [List], {name: 'lists'})
  async getListsByUser(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }
}
