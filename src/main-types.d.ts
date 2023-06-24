interface Unit {
  name: string;
  kind: string;
  namespace: string; // This will initially be empty
}

interface PipelineUnit extends Unit {
  parameters: string;
  units: string[];
}

interface CommandUnit extends Unit {
  commands?: any[];
}

interface RenderStateMini {
  files: Record<string, string>;
  units: Unit[];
}

interface RenderState extends RenderStateMini {
  state: Record<string, any>;
  fragmentBlocks: Record<string, any>;
  fragmentLists: Record<string, any[]>;
}

interface UnitHandler {
  isStandalone(unit: Unit): boolean;
  renderStandalone(unit: Unit, state: RenderState): string[];
  render(
    unit: Unit,
    state: RenderState,
    parameterBag: Record<string, any>,
  ): void;
}
