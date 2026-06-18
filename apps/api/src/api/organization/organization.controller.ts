import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { CurrentUser } from 'core/auth/current-user.types';
import { DepartmentsService } from 'core/departments/departments.service';
import { OrganizationsService } from 'core/organizations/organizations.service';
import { UsersService } from 'core/users/users.service';
import { UserRole } from 'generated/prisma/enums';

import { CurrentUserParam } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../pagination.dto';
import { parseOptionalPagination } from '../query.utils';

class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

class DepartmentDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

class CreateOrganizationUserDto {
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

  @IsIn([UserRole.ORG_MANAGER, UserRole.EMPLOYEE])
  role!: Extract<UserRole, 'ORG_MANAGER' | 'EMPLOYEE'>;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  departmentIds?: string[];
}

class UpdateOrganizationUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsIn([UserRole.ORG_MANAGER, UserRole.EMPLOYEE])
  role?: Extract<UserRole, 'ORG_MANAGER' | 'EMPLOYEE'>;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  departmentIds?: string[];
}

@ApiBearerAuth()
@ApiTags('organization')
@Roles(UserRole.ORG_MANAGER)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getOwn(@CurrentUserParam() actor: CurrentUser) {
    return this.organizationsService.getOwnOrganization(actor);
  }

  @Patch()
  updateOwn(
    @CurrentUserParam() actor: CurrentUser,
    @Body() body: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateOrganization(
      actor,
      actor.organizationId!,
      body,
    );
  }

  @Get('departments')
  listDepartments(
    @CurrentUserParam() actor: CurrentUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.departmentsService.list(actor, parseOptionalPagination(query));
  }

  @Post('departments')
  createDepartment(
    @CurrentUserParam() actor: CurrentUser,
    @Body() body: DepartmentDto,
  ) {
    return this.departmentsService.create(actor, body.name);
  }

  @Patch('departments/:id')
  updateDepartment(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Body() body: DepartmentDto,
  ) {
    return this.departmentsService.update(actor, id, body.name);
  }

  @Delete('departments/:id')
  archiveDepartment(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.departmentsService.archive(actor, id);
  }

  @Get('users')
  listUsers(
    @CurrentUserParam() actor: CurrentUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.usersService.listOrganizationUsers(
      actor,
      parseOptionalPagination(query),
    );
  }

  @Post('users')
  createUser(
    @CurrentUserParam() actor: CurrentUser,
    @Body() body: CreateOrganizationUserDto,
  ) {
    return this.usersService.createUser(actor, body);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Body() body: UpdateOrganizationUserDto,
  ) {
    return this.usersService.updateOrganizationUser(actor, id, body);
  }

  @Delete('users/:id')
  archiveUser(@CurrentUserParam() actor: CurrentUser, @Param('id') id: string) {
    return this.usersService.archiveOrganizationUser(actor, id);
  }
}
