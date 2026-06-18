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

class OrganizationDto {
  @IsString()
  @MinLength(1)
  name!: string;

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
@ApiTags('organizations')
@Roles(UserRole.ADMIN)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.organizationsService.listOrganizations(
      parseOptionalPagination(query),
    );
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.organizationsService.getOrganization(id);
  }

  @Post()
  create(
    @CurrentUserParam() actor: CurrentUser,
    @Body() body: OrganizationDto,
  ) {
    return this.organizationsService.createOrganization(actor, body);
  }

  @Patch(':id')
  update(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Body() body: OrganizationDto,
  ) {
    return this.organizationsService.updateOrganization(actor, id, body);
  }

  @Post(':id/archive')
  archive(@CurrentUserParam() actor: CurrentUser, @Param('id') id: string) {
    return this.organizationsService.archiveOrganization(actor, id);
  }

  @Get(':id/departments')
  listDepartments(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.departmentsService.listByOrganizationId(
      id,
      parseOptionalPagination(query),
    );
  }

  @Post(':id/departments')
  createDepartment(@Param('id') id: string, @Body() body: DepartmentDto) {
    return this.departmentsService.createByOrganizationId(id, body.name);
  }

  @Patch(':id/departments/:departmentId')
  updateDepartment(
    @Param('id') id: string,
    @Param('departmentId') departmentId: string,
    @Body() body: DepartmentDto,
  ) {
    return this.departmentsService.updateByOrganizationId(
      id,
      departmentId,
      body.name,
    );
  }

  @Delete(':id/departments/:departmentId')
  archiveDepartment(
    @Param('id') id: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.departmentsService.archiveByOrganizationId(id, departmentId);
  }

  @Get(':id/users')
  listUsers(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.usersService.listUsersByOrganizationId(
      id,
      parseOptionalPagination(query),
    );
  }

  @Post(':id/users')
  createUser(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Body() body: CreateOrganizationUserDto,
  ) {
    return this.usersService.createUser(actor, {
      ...body,
      organizationId: id,
    });
  }

  @Patch(':id/users/:userId')
  updateUser(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: UpdateOrganizationUserDto,
  ) {
    return this.usersService.updateUserByOrganizationId(
      actor,
      id,
      userId,
      body,
    );
  }

  @Delete(':id/users/:userId')
  archiveUser(
    @CurrentUserParam() actor: CurrentUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.archiveUserByOrganizationId(actor, id, userId);
  }
}
