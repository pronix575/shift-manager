import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

import { CurrentUser } from 'core/auth/current-user.types';
import { UsersService } from 'core/users/users.service';
import { UserRole } from 'generated/prisma/enums';

import { CurrentUserParam } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';

class CreateAdminDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@ApiBearerAuth()
@ApiTags('admins')
@Roles(UserRole.ADMIN)
@Controller('admins')
export class AdminsController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@CurrentUserParam() actor: CurrentUser, @Body() body: CreateAdminDto) {
    return this.usersService.createUser(actor, {
      ...body,
      role: UserRole.ADMIN,
      organizationId: null,
      departmentIds: [],
    });
  }
}
