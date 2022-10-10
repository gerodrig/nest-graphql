import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'lists'})
@ObjectType()
export class List {
  
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  //Relation, index('userId-list-index', 'userId')
  @ManyToOne(() => User, user => user.lists, {lazy: true})
  @Index('userId-list-index')
  @Field(() => User)
  user: User;

  @OneToMany(() => ListItem, listItem => listItem.list, {lazy: true})
  // @Field(() => [ListItem])
  listItem: ListItem;
}
