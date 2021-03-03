type Filter = {
  [k: string]: any[]
};

export class QueryFilter<F extends Filter, K extends keyof F = keyof F> { 
  constructor (
    private targetField: K,
    private values: F[K]
  ) {}

  get TargetField() {
    return this.targetField;
  }
  get Values() {
    return this.values;
  }

  static combine<F extends Filter>(...filters: QueryFilter<F>[]): Partial<F> {
    const combined: Partial<F> = {};
    for (const qf of filters) {
      combined[qf.TargetField] = qf.Values;
    }
    return combined;
  }
}
