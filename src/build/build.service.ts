import { Injectable } from '@nestjs/common';
import * as YAML from 'yaml';
import { PipelineHandler } from '../handlers/pipeline.handler';
import { CommandHandler } from '../handlers/command.handler';
import { v4 as uuidv4 } from 'uuid';
import { ContainerHandler } from '../handlers/container.handler';

@Injectable()
export class BuildService {
  static handlers: Record<string, UnitHandler> = {};

  buildPipelines(files: Record<string, string>): Record<string, string> {
    const units: Unit[] = [];

    const results: Record<string, string> = {};

    const miniState: RenderStateMini = {
      files,
      units,
      rewrites: {},
    };

    this.loadUnits('config.yml', miniState);

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

  loadUnits(file: string, miniState: RenderStateMini, namespace = uuidv4()) {
    const configRaw = miniState.files[file];

    if (!configRaw) {
      return;
    }

    const newList: Unit[] = YAML.parseDocument(configRaw)
      .toJSON()
      .map((doc) => ({
        ...doc,
        namespace,
      }));

    const packages: PackageUnit[] = [];

    for (const unit of newList) {
      if (unit.kind === 'package') {
        packages.push(unit as PackageUnit);
      } else {
        miniState.units.push(unit);
      }
    }

    for (const pack of packages) {
      const targetNamespace = uuidv4();

      miniState.rewrites[`${namespace}.${pack.name}`] = targetNamespace;

      this.loadUnits(pack.source, miniState, targetNamespace);
    }
  }
}

BuildService.handlers['pipeline'] = new PipelineHandler();
BuildService.handlers['command'] = new CommandHandler();
BuildService.handlers['container'] = new ContainerHandler();
