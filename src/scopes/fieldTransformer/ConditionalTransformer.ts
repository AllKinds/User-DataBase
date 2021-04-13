import { getByPath, setByPath, deleteByPath } from '../../utils';
import { Condition } from './condition/Condition';

export interface ConditionalTransform<T> {
  apply(source: T, conditionSource?: T): Partial<T>;
}

export interface ConditionalTransformConstructor<T> {
  new (path: string[], conditions: Condition[], ...args: unknown[]): 
    ConditionalTransform<T>;
}

// type HaveArrayOf<K extends string, V> = {
//   [k in K]: V[]
// };

// type ArrayItem<T> = T extends (infer I)[] ? I : never;

export class ArrayFilter<T>
implements ConditionalTransform<T> {
  constructor(
    private arrayPath: string[],
    private conditions: Condition[]
  ) {}

  apply = (source: T) => {
    const arrProp = getByPath(source, this.arrayPath);
    if (!arrProp) {
      return source;
    }
    const filtered = arrProp.filter((item: any) => !Condition.and(item, ...this.conditions));
    const copy = { ...source };
    setByPath(copy, this.arrayPath, filtered);
    return copy;
  }
}

export class ArrayMapper<T, U> implements ConditionalTransform<T> {
  constructor(
    private arrayPath: string[],
    private conditions: Condition[],
    private transformer: ConditionalTransform<U>
  ) {}

  apply = (source: T) => {
    if (Condition.and(source, ...this.conditions)) {
      const arrProp = getByPath(source, this.arrayPath);
      if (!arrProp) {
        return source;
      }
      const copy = { ...source };
      const transformed = arrProp.map((item: any) => this.transformer.apply(item));
      setByPath(copy, this.arrayPath, transformed);
      return copy;
    }
    return source;
  }
}

export class FieldExclude<T> implements ConditionalTransform<T> {
  constructor(
    private fieldPath: string[],
    private conditions: Condition<T>[] = []
  ) {}

  apply = (source: T, conditionSource?: T) => {
    if (Condition.and(conditionSource || source, ...this.conditions)) {
      const copy = { ...source };
      deleteByPath(copy, this.fieldPath);
      return copy;
    }
    return source;
  }
}

