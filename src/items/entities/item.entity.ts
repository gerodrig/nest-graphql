import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

import { User } from 'src/users/entities/user.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({name: 'items'})
@ObjectType()
export class Item {

 @PrimaryGeneratedColumn('uuid')
 @Field(() => ID)
 id: string;

 @Column()
 @Field(() => String)
 name: string;

 @Column({nullable: true})
 @Field(() => Float, {nullable: true})
 @IsOptional()
 quantity:number;

 @Column({nullable: true})
 @Field(() => String, {nullable: true})
 quantityUnits?: string; //g, ml, kg, tsp

 //stores

 //user
 @ManyToOne(() => User, user => user.items, {nullable: false, lazy: true})
 @Index('userId-index')
 @Field(() => User)
 user: User;

 @OneToMany(() => ListItem, listItem => listItem.item, {lazy: true})
 @Field(() => [ListItem])
 listItem: ListItem;
}

