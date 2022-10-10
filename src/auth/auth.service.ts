import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { SignupInput, LoginInput } from './dto/inputs/';
import { AuthResponse } from './dto/types/auth-response.type';

import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    private getJwtToken( userId: string) {
        return this.jwtService.sign({ id: userId });
    }

    async signup(signupInput: SignupInput): Promise<AuthResponse> {
      
        const user = await this.usersService.create(signupInput);

        const token = this.getJwtToken(user.id);

        return {
            token,
            user
        }
    };

    async login(loginInput: LoginInput): Promise<AuthResponse> {

        const { email , password } = loginInput;

        const user = await this.usersService.findOneByEmail(email);

        //check password
        if(!bcrypt.compareSync(password, user.password)){
            throw new BadRequestException('Invalid credentials');
        }
        
        const token = this.getJwtToken(user.id);

        return {
            token,
            user
        }
    };

    async validateUser( userId: string ): Promise<User> {
        const user = await this.usersService.findOneById(userId);

        if(!user.id) {
            throw new UnauthorizedException('User is inactive, please contact admin');
        }

        delete user.password;

        return user;
    };

    revalidateToken( user: User ): AuthResponse{
        const token = this.getJwtToken(user.id);

        return {
            token,
            user
        }
    }
}
