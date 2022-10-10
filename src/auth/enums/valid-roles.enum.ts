
import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {
    admin = 'admin',
    user = 'user',
    guest = 'guest',
    superadmin = 'superadmin',
    superUser = 'superUser',
}

registerEnumType( ValidRoles, {name: 'ValidRoles', description: 'This is a list of valid roles allowed in the system.'} );