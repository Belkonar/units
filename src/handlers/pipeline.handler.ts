import * as YAML from 'yaml';
import { BuildService } from '../build/build.service';
import { getStep } from '../helpers';

export class PipelineHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    const pipeline = unit as PipelineUnit;
    return !pipeline.packed;
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    let pipeline = unit as PipelineUnit;

    state.fragmentBlocks['jobs'] = {
      init: {
        'runs-on': 'ubuntu-latest',
        steps: [
          {
            uses: 'actions/checkout@v3',
          },
          {
            uses: 'actions/upload-artifact@v3',
            with: {
              name: 'build',
              path: '*\n!.git/*',
            },
          },
        ],
      },
    };

    state.state['lastJob'] = 'init';

    const parameterBag: Record<string, any> = {};

    if (pipeline.parameters) {
      parameterBag['root'] = JSON.parse(state.files[pipeline.parameters]);
    }

    if (pipeline.reference) {
      const newPipeline = getStep<PipelineUnit>(
        pipeline.reference,
        '',
        state,
        unit.namespace,
      );

      pipeline = {
        ...pipeline,
        units: newPipeline.units,
        namespace: newPipeline.namespace,
      };
    }

    for (const unitName of pipeline.units) {
      const unitRef = this.parseUnitRef(unitName, pipeline.namespace);

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

      handler.render(targetUnit, state, parameterBag);
    }

    const pipelineCode = {
      jobs: state.fragmentBlocks['jobs'],
      name: unit.name,
      on: ['push'],
    };

    return [
      `.github/workflows/${pipeline.name}.yml`,
      YAML.stringify(pipelineCode),
    ];
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

  render(unit: Unit, state: RenderState, parameterBag: Record<string, any>) {
    // No Op
  }
}
