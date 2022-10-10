import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles.enum';


export const CurrentUser = createParamDecorator(
    ( roles: ValidRoles[] = [], context: ExecutionContext ) => {
        const ctx = GqlExecutionContext.create( context );
        const user = ctx.getContext().req.user;

        if( !user ){
            throw new InternalServerErrorException('User not found in request - make sure you are using the @UseGuards(JwtAuthGuard) decorator');
        }

        //if no roles are passed, return the user
        if( roles.length === 0 ) return user;

        //if roles are passed, check if the user has one of the roles
        for (const role of user.roles) {
            if( roles.includes( role) ) return user;
        }

        throw new ForbiddenException('You do not have permission to access this resource. Only users with the following roles are allowed: ' + roles.join(', '));
});