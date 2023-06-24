import { replacer } from '../helpers';

export class CommandHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return false;
  }

  render(unit: Unit, state: RenderState, parameterBag: Record<string, any>) {
    const command = unit as CommandUnit;
    const jobs = state.fragmentBlocks['jobs'] as Record<string, any>;

    const steps: any[] = [];

    const persist = {
      uses: 'actions/upload-artifact@v3',
      with: {
        name: 'build',
        path: '*',
      },
    };

    const restore = {
      uses: 'actions/download-artifact@v3',
      with: {
        name: 'build',
      },
    };

    steps.push(restore);

    for (const cmd of command.commands ?? []) {
      steps.push({
        run: cmd,
      });
    }

    for (const cmd of command.rawCommands ?? []) {
      steps.push(cmd);
    }

    steps.push(persist);

    jobs[command.name] = replacer(
      {
        'runs-on': 'ubuntu-latest',
        steps,
        needs: [state.state['lastJob']],
      },
      parameterBag,
    );

    state.state['lastJob'] = command.name;

    // TODO: implement
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    return [];
  }
}
