import { ValidatorObj } from './types/validation';
import { DOMAIN_MAP } from './config/db-enums';

export const domainMap : Map<string, string> = new Map<string, string>(JSON.parse(JSON.stringify(DOMAIN_MAP)));
export const DomainSeperator = '@';

export function filterObjectByKeys(object: Object, allowedKeys: string[]): Object {
  const filtered = Object.keys(object)
  .filter(key => allowedKeys.includes(key))
  .reduce(
    (obj, key) => {
      obj[key] = object[key];
      return obj;
    }, 
    {});
  return filtered;
}
/**
 * Sort array of objects according to IDs array
 * @param objects Array objects to sort
 * @param array IDs array to sort by them
 */
export function sortObjectsByIDArray(objects: Object[], array: string[]) : Object[] {
  const newObjects: Object[] = [];
  array.forEach((idValue) => {
    const currObject = objects.find(object => object['id'] === idValue.toString());
    if (currObject) {newObjects.push(currObject);} 
  });

  return newObjects;
}

/**
 * Returns all indices of a value in the array
 * @param arr Array to search in
 * @param val The value to find
 */
export function allIndexesOf(arr: any[], val: any) {
  const indices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) indices.push(i);
  }
  return indices;
}

export function reflectPromise<T>(p: Promise<T>, putNull = false): Promise<{ v?: T, e?: any, status: string }> {
  return p.then(v => ({ v, status: 'fulfilled' }),
    e => (putNull ? null : { e, status: 'rejected' }));
}

export async function promiseAllWithFails(promiseArray: Promise<any>[], valueErr?: any) { 
  return await Promise.all(promiseArray.map(promise => promise.catch(err => valueErr ? valueErr : err))); 
}

export async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Checks if fields name in array is an empty or null and deleted them
 * also filters empty or null from array fields
 * @param obj Object to filter
 * @param array Fileds to filter 
 */
export function filterEmptyField(obj: object, array: string[]) {
  for (let index = 0; index < array.length; index++) {
    const value = obj[array[index]];
    if (value !== undefined) {
      if (!obj[array[index]]) { // empty, null, etc..
        delete obj[array[index]];
      } else if (Array.isArray(value)) { // filter out falsly values
        obj[array[index]] = value.filter((val:any) => val);
        if (obj[array[index]].length === 0) {
          delete obj[array[index]];
        }
      }
    }
  }
}

/**
 * Runs the given validators on the given value, returns an object with the following signature:
 * isValid - true if all validators passed, false otherwise.
 * messages - string array of error messages from the validators
 * @param validatorObjects 
 * @param valueToValidate 
 */
export function validatorRunner(validatorObjects: Iterable<ValidatorObj>, valueToValidate: any) {
  const messages = [];
  let allPassed = true;
  for (const validatorObj of validatorObjects) {
    if (!validatorObj.validator(valueToValidate)) {
      allPassed = false;
      const msg = evalStringWithValue(validatorObj.message, valueToValidate);
      messages.push(msg);
    }
  }
  return { messages, isValid: allPassed };
}

function evalStringWithValue(str: string, value: any, valueToMatch: string = 'VALUE') {
  return str.replace(/\{(([^{])+)\}/g, (_: string, match: string) => {
    const keys = match.split('.');
    if (keys.length === 0 || keys[0] !== valueToMatch) { return match; }
    const nestedKeys = keys.slice(1);
    let v = typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
    for (const k of nestedKeys) {
      v = v[k];
    }
    return typeof v === 'object' ? JSON.stringify(v) : v;
  });
}

/**
 * Returns a proxy object with the same values of the original object,
 * but with case insensitive key lookup, and lowercases all keys in Object.keys()
 * @param originalObj original object
 * @returns proxy object
 */
export function proxyCaseInsensitive(originalObj: Object) {
  return new Proxy(originalObj, {
    get: (target, name: string) => target[Object.keys(target)
      .find(k => k.toLowerCase() === name.toLowerCase())],
    ownKeys: target => Object.keys(target).map(k => k.toLowerCase()),
    getOwnPropertyDescriptor: k => ({ enumerable: true, configurable: true }),
  });
}
