import { BuildService } from '../build/build.service';
import * as jmespath from 'jmespath';

export class ContainerHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return false;
  }

  render(
    unit: Unit,
    state: RenderState,
    parameterBag: Record<string, any>,
  ): void {
    const container = unit as ContainerUnit;

    if (container.loop === undefined) {
      this.handleSingle(container, state, parameterBag);
    } else {
      this.handleLoop(container, state, parameterBag);
    }
  }

  private handleSingle(
    container: ContainerUnit,
    state: RenderState,
    parameterBag: Record<string, any>,
  ) {
    for (const unitName of container.units) {
      const unitRef = this.parseUnitRef(unitName, container.namespace);

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
  }

  // TODO: Move this to a common place
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

  private handleLoop(
    container: ContainerUnit,
    state: RenderState,
    parameterBag: Record<string, any>,
  ) {
    const iter = jmespath.search(parameterBag, container.loop);
    console.log(iter);

    const snapshot = state.state['postfix'] as string;

    for (const i in iter) {
      const item = iter[i];
      state.state['postfix'] = `${snapshot}-${i}`;

      // parameterBag[container.as] = item;
      this.handleSingle(container, state, {
        ...parameterBag,
        [container.as]: item,
      });
    }

    state.state['postfix'] = snapshot;

    // for (const unitName of container.units) {
    //   const unitRef = this.parseUnitRef(unitName, container.namespace);
    //
    //   const targetUnit = state.units.find(
    //     (x) =>
    //       x.name === unitRef.name &&
    //       x.kind === unitRef.kind &&
    //       x.namespace === unitRef.namespace
    //   );
    //
    //   if (targetUnit === undefined) {
    //     throw new Error(`Unit not found: ${unitName}`);
    //   }
    //
    //   const handler = BuildService.handlers[targetUnit.kind];
    //
    //   if (handler === undefined) {
    //     throw new Error(`Handler not found: ${targetUnit.kind}`);
    //   }
    //
    //   handler.render(targetUnit, state, parameterBag);
    // }
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    return [];
  }
}
