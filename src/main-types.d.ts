interface Unit {
  name: string;
  kind: string;
  namespace: string; // This will initially be empty
}

interface PipelineUnit extends Unit {
  parameters: string;
  units: string[];
  packed: boolean;
  reference: string;
}

interface ContainerUnit extends Unit {
  units: string[];
  loop?: string;
  as?: string;
}

interface CommandUnit extends Unit {
  commands?: any[];
}

interface PackageUnit extends Unit {
  name: string;
  source: string;
}

interface RenderStateMini {
  files: Record<string, string>;
  units: Unit[];
  rewrites: Record<string, string>;
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
