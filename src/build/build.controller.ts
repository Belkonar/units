import { Body, Controller, Post } from '@nestjs/common';
import { BuildService } from './build.service';

@Controller('build')
export class BuildController {
  constructor(private buildService: BuildService) {}

  @Post()
  generateBuild(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      // base64 decode the value
      body[key] = Buffer.from(value, 'base64').toString('utf-8');
    }

    const response = this.buildService.buildPipelines(body);

    for (const [key, value] of Object.entries(response)) {
      // base64 encode the value
      response[key] = Buffer.from(value).toString('base64');
    }

    return response;
  }
}
