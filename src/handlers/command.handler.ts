import { replacer } from '../helpers';
import { v4 as uuidv4 } from 'uuid';

export class CommandHandler implements UnitHandler {
  isStandalone(unit: Unit): boolean {
    return false;
  }

  render(unit: Unit, state: RenderState, parameterBag: Record<string, any>) {
    const command = unit as CommandUnit;
    const commandName = command.name + '-' + uuidv4().split('-')[0];
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

    jobs[commandName] = replacer(
      {
        'runs-on': 'ubuntu-latest',
        steps,
        needs: [state.state['lastJob']],
      },
      parameterBag,
    );

    state.state['lastJob'] = commandName;

    // TODO: implement
  }

  renderStandalone(unit: Unit, state: RenderState): string[] {
    return [];
  }
}
