import * as jmespath from 'jmespath';

export function replacer<T>(obj: T, parameterBag: Record<string, any>): T {
  const regex = /{{(.+?)}}/g;

  let str = JSON.stringify(obj);

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
