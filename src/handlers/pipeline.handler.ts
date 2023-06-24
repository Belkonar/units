import * as YAML from 'yaml';
import { BuildService } from '../build/build.service';

export class PipelineHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return true;
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    const pipeline = unit as PipelineUnit;

    state.fragmentBlocks['jobs'] = {};

    for (const unitName of pipeline.units) {
      const unitRef = this.parseUnitRef(unitName, unit.namespace);
      const targetUnit = state.units.find(
        (x) =>
          x.name === unitRef.name &&
          x.kind === unitRef.kind &&
          x.namespace === unitRef.namespace,
      );

      if (targetUnit === undefined) {
        throw new Error(`Unit not found: ${unitName}`);
      }

      const handler = BuildService.handlers[targetUnit.kind];

      if (handler === undefined) {
        throw new Error(`Handler not found: ${targetUnit.kind}`);
      }

      handler.render(targetUnit, state);
    }

    const pipelineCode = {
      jobs: state.fragmentBlocks['jobs'],
      name: 'ci',
      on: ['push'],
    };

    return [`.github/workflows/${unit.name}.yml`, YAML.stringify(pipelineCode)];
  }

  parseUnitRef(unitRef: string, n: string): Unit {
    if (!unitRef.includes('.')) {
      unitRef = `${n}.${unitRef}`;
    }

    const [namespace, nameParts] = unitRef.split('.');

    const [kind, name] = nameParts.split(':');

    return {
      name,
      kind,
      namespace,
    };
  }

  render(unit: Unit, state: RenderState) {
    // No Op
  }
}
