import { Request, Response, NextFunction } from 'express';
import { KeyMap, ValueMap, transformKeys, ObjectValueMap,
  transformValues, filterObjectByKeys } from '../utils';

interface QueryMiddlewareOpts {
  paramsRenameMap?: KeyMap;
  filterParams?: string[];
  defaults?: ValueMap;
  valueAliases?: ObjectValueMap;
}

function transformQuery(
  originalQuery: object,
  queryParamsRenameMap: KeyMap = {},
  filterQueryParams: string[] = null,
  queryDefaults: ValueMap = {}, 
  queryValuesAliases: ObjectValueMap = {}) {
  // rename query params
  const renamed = transformKeys(originalQuery, queryParamsRenameMap);
  // filter params
  const filtered = filterQueryParams ? filterObjectByKeys(renamed, filterQueryParams) : renamed;
  // apply defaults
  const tQuery = { ...queryDefaults, ...filtered };
  // apply values aliases and return 
  return transformValues(tQuery, queryValuesAliases);
}

/**
 * 
 * @param middlewareOpts object with keys: 
 * @param `middlewareOpts.paramsRenameMap` - object that maps query params original names to new names.
 * @param `middlewareOpts.filterParams` - array of allowed query params, defaults to `null` - which is not filtering.
 * @param `middlewareOpts.defaults` - default values for params.
 * @param `middlewareOpts.valueAliases` - objects that maps param to it's alieses map - which is an object by itself;
 * this object maps values of the param to a new value.
 */
export const makeMiddleware = (middlewareOpts: QueryMiddlewareOpts) => 
  (req: Request, res: Response, next: NextFunction) => {
    const { paramsRenameMap, filterParams, defaults, valueAliases } = middlewareOpts;
    req.query = transformQuery(req.query, paramsRenameMap, filterParams, defaults, valueAliases);
    next();
  };

