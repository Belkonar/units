export class CommandHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return false;
  }

  render(unit: Unit, state: RenderState) {
    const command = unit as CommandUnit;
    const jobs = state.fragmentBlocks['jobs'] as Record<string, any>;

    const steps: any[] = [];

    for (const cmd of command.commands ?? []) {
      steps.push({
        run: cmd,
      });
    }

    for (const cmd of command.rawCommands ?? []) {
      steps.push(cmd);
    }

    jobs[command.name] = {
      'runs-on': 'ubuntu-latest',
      steps,
    };

    // TODO: implement
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    return [];
  }
}
