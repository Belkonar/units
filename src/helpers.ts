import * as jmespath from 'jmespath';

export function replacer<T>(obj: T, parameterBag: Record<string, any>): T {
  const regex = /<% *(.+?) *%>/g;

  let str = JSON.stringify(obj);

  console.log(str);

  const matches = [...str.matchAll(regex)];

  for (const match of matches) {
    const [fullMatch, key] = match;

    const data = jmespath.search(parameterBag, key);

    if (!nullOrUndefined(data)) {
      str = str.replaceAll(fullMatch, jmespath.search(parameterBag, key));
    }
  }

  return JSON.parse(str) as T;
}

export function nullOrUndefined(x: any): boolean {
  return x === null || x === undefined;
}

export function getStep<T>(
  unit: string,
  n: string,
  miniState: RenderStateMini,
  sourceNamespace: string,
): T {
  const unitRef = parseUnitRef(unit, n);

  const namespace =
    miniState.rewrites[`${sourceNamespace}.${unitRef.namespace}`] ||
    unitRef.namespace;

  return miniState.units.find(
    (x) =>
      x.name === unitRef.name &&
      x.kind === unitRef.kind &&
      x.namespace === namespace,
  ) as T;
}

export function parseUnitRef(unitRef: string, n: string): Unit {
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
