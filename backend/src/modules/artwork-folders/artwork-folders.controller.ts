import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { t } from '../../common/utils/i18n.util';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';
import { UserRole } from '../../identity/user/entities/user.entity';
import { CreateArtworkFolderDto } from './dto/create-artwork-folder.dto';
import { ListFolderArtworksQueryDto } from './dto/list-folder-artworks-query.dto';
import { MoveArtworkFolderDto } from './dto/move-artwork-folder.dto';
import { UpdateArtworkFolderDto } from './dto/update-artwork-folder.dto';
import { ArtworkFoldersService } from './artwork-folders.service';

@Controller()
@Roles(UserRole.ARTIST)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArtworkFoldersController {
  constructor(private readonly foldersService: ArtworkFoldersService) {}

  @Post('sellers/:sellerId/artwork-folders')
  create(
    @Param('sellerId') sellerId: string,
    @Req() req: RequestWithUser,
    @Body() body: CreateArtworkFolderDto,
  ) {
    this.assertOwnSeller(sellerId, req.user.id);
    return this.foldersService.create(sellerId, body);
  }

  @Get('sellers/:sellerId/artwork-folders/tree')
  findTree(@Param('sellerId') sellerId: string, @Req() req: RequestWithUser) {
    this.assertOwnSeller(sellerId, req.user.id);
    return this.foldersService.findTree(sellerId);
  }

  @Get('artwork-folders/:folderId')
  findOne(@Param('folderId') folderId: string, @Req() req: RequestWithUser) {
    return this.foldersService.findOne(folderId, req.user.id);
  }

  @Patch('artwork-folders/:folderId')
  update(
    @Param('folderId') folderId: string,
    @Req() req: RequestWithUser,
    @Body() body: UpdateArtworkFolderDto,
  ) {
    return this.foldersService.update(folderId, req.user.id, body);
  }

  @Get('artwork-folders/:folderId/artworks')
  listArtworks(
    @Param('folderId') folderId: string,
    @Req() req: RequestWithUser,
    @Query() query: ListFolderArtworksQueryDto,
  ) {
    return this.foldersService.listArtworks(folderId, req.user.id, query);
  }

  @Patch('artwork-folders/:folderId/move')
  move(
    @Param('folderId') folderId: string,
    @Req() req: RequestWithUser,
    @Body() body: MoveArtworkFolderDto,
  ) {
    return this.foldersService.move(folderId, req.user.id, body);
  }

  @Delete('artwork-folders/:folderId')
  remove(@Param('folderId') folderId: string, @Req() req: RequestWithUser) {
    return this.foldersService.remove(folderId, req.user.id);
  }

  private assertOwnSeller(sellerId: string, userId: string) {
    if (sellerId !== userId) {
      throw new ForbiddenException(t('artwork_folder.access_denied'));
    }
  }
}
