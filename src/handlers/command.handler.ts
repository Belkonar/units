import { replacer } from '../helpers';
import { v4 as uuidv4 } from 'uuid';

export class CommandHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return false;
  }

  render(unit: Unit, state: RenderState, parameterBag: Record<string, any>) {
    const command = unit as CommandUnit;
    const commandName = command.name + state.state['postfix'];
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
      if (typeof cmd === 'string') {
        steps.push({
          run: cmd,
        });
      } else {
        steps.push(cmd);
      }
    }

    steps.push(persist);

    const extras = command.extras ?? {};

    const jobTemp: any = {
      'runs-on': command.host ?? 'ubuntu-latest',
      steps,
      needs: [state.state['lastJob']],
      ...extras,
    };

    if (command.container) {
      jobTemp.container = command.container;
    }

    if (command.environment) {
      jobTemp.environment = command.environment;
    }

    jobs[commandName] = replacer(jobTemp, parameterBag);

    state.state['lastJob'] = commandName;
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    return [];
  }
}
