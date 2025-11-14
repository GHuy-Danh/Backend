import { Controller, Get, Param } from '@nestjs/common';
import { CaHocService } from './ca_hoc.service';

@Controller('ca-hoc')
export class CaHocController {
  constructor(private readonly caService: CaHocService) {}

  @Get()
  async getAll() {
    const data = await this.caService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.caService.findById(id);
    return { success: true, data };
  }
}
