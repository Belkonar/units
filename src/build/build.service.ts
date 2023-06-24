import { Injectable } from '@nestjs/common';
import * as YAML from 'yaml';
import { PipelineHandler } from '../handlers/pipeline.handler';
import { CommandHandler } from '../handlers/command.handler';

@Injectable()
export class BuildService {
  static handlers: Record<string, UnitHandler> = {};

  buildPipelines(files: Record<string, string>): Record<string, string> {
    const configRaw = files['config.yml'];

    if (!configRaw) {
      return {};
    }

    const results: Record<string, string> = {};

    const units = YAML.parseAllDocuments(configRaw).map((doc) =>
      doc.toJSON(),
    ) as Unit[];

    units.forEach((unit) => {
      unit.namespace = 'local'; // TODO: fix this
    });

    const miniState: RenderStateMini = {
      files,
      units,
    };

    for (const unit of units) {
      const handler = BuildService.handlers[unit.kind];
      if (handler !== undefined && handler.isStandalone(unit)) {
        const state: RenderState = {
          ...miniState,
          state: {},
          fragmentBlocks: {},
          fragmentLists: {},
        };

        const [key, value] = handler.renderStandalone(unit, state);

        results[key] = value;
      }
    }

    return results;
  }
}

BuildService.handlers['pipeline'] = new PipelineHandler();
BuildService.handlers['command'] = new CommandHandler();
