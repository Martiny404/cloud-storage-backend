import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { USER_NOT_FOUND } from 'src/common/constants/errors/user.errors';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { UserService } from './services/user.service';

@UseFilters(HttpExceptionFilter)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/test/')
  async test(@Query() query) {
    return {
      message: 'Hello!',
      query: query,
    };
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('ADMIN')
  @Post('/add-role/:id')
  addRole(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() { roleId }: AddRoleDto,
  ) {
    return this.userService.addRole(id, roleId);
  }

  @Patch('/update-user/:id')
  updateUser(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('nickName') nickName: string,
  ) {
    return this.userService.update(id, nickName);
  }

  @UseGuards(AuthorizationGuard)
  @Get('/me')
  async getMe(@Req() req: AppClientRequest) {
    const id = req.user.id;
    const user = await this.userService.findOneBy({ where: { id } });
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    return user;
  }
}
