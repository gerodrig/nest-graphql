import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateItemInput {

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  // @Field(() => Float)
  // @Min(0)
  // @IsPositive()
  // quantity: number;

  @Field(() => String, {nullable: true})
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
