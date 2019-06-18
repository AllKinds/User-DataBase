import { Request, Response, NextFunction, Router } from 'express';
import * as _ from 'lodash';
import { ApplicationError } from '../types/error';

export class RouteParamsValidate {

  static startsWithAnA(str: string) {
    if (str[0] !== 'A') {
      throw new ApplicationError('Does not start with an A!', 400);
    }
  }

  static toDo() {
    return;
  }

  static differentParams(param_1: any, param_2: any) {
    if (param_1 === param_2) {
      throw new ApplicationError('Cannot receive identical parameters!', 400);
    }
  }

  static dateOrInt(param: any) {
    if (!(RouteParamsValidate.isValidDate(param) || RouteParamsValidate.isInt(param))) {
      throw new ApplicationError('Did not receive a valid date', 400);
    }
  }

  static fieldExistanceGenerator(allowedfields: string[], requireAll: boolean = false) {
    return (obj: Object) => {
      const diff = _.difference(Object.keys(obj), allowedfields);
      if (diff.length !== 0) {
        throw new ApplicationError(`unexpected fields: ${diff}`, 400);
      } else if (requireAll && allowedfields.length !== Object.keys(obj).length) {
        const missingFields = _.difference(allowedfields, Object.keys(obj));
        throw new ApplicationError(`missing required fields: ${missingFields}`, 400);
      }
    };
  }

  private static isValidDate(val: any): Boolean {
    return val instanceof Date;
  }

  private static isInt(val: any): Boolean {
    return !isNaN(val) || parseInt(Number(val) + '') === val || !isNaN(parseInt(val, 10));
  }
}

export const validatorMiddleware =
  (validator: Function, varNames: string[] = [], path: string = 'body', errStatus:number = 400) =>
  (req: Request, res: Response, next: NextFunction) => {
    const usePath = !varNames || varNames.length === 0;
    const vars = usePath ? [req[path]] : varNames.map(varName => req[path][varName]);
    try {
      const result = validator(...vars);
      next();
    } catch (err) {
      // res.status(errStatus).send(err.message);
      next(err); // pass to the error handling middleware
    }
  };
