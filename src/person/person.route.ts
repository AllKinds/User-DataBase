import { Request, Response, NextFunction, Router } from 'express';
import { filterObjectByKeys } from '../utils';
import { controllerHandler as ch } from '../helpers/controller.helper';
import { PermissionMiddleware } from '../middlewares/permission.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { Person } from './person.controller';
// import { IPerson, EDITABLE_FIELDS, PERSON_FIELDS } from './person.interface';
import { validatorMiddleware, RouteParamsValidate as Vld } from '../helpers/route.validator';
import { atCreateFieldCheck, atUpdateFieldCheck } from './person.route.validator';

// const person = new Person();
const persons = Router();

persons.use('/', AuthMiddleware.verifyToken, PermissionMiddleware.hasBasicPermission);

persons.get('/', ch(Person.getPersons, (req: Request) => [req.query]));

persons.get('/getUpdated/:from', validatorMiddleware(Vld.dateOrInt, ['from'], 'params') , 
          ch(Person.getUpdatedFrom, (req: Request) => {
            let from = req.params.from;
            if (typeof(from) === 'number') from = new Date(from);
            return [from, new Date()];
          }
));

persons.post('/', PermissionMiddleware.hasAdvancedPermission,
           validatorMiddleware(atCreateFieldCheck),
           ch(Person.createPerson, (req: Request) => [req.body]));

persons.post('/domainUser', PermissionMiddleware.hasAdvancedPermission,
            ch(Person.addNewUser, (req: Request) => {
              return [req.body.personId, req.body.uniqueID, req.body.isPrimary];
            }));

persons.get('/:id', (req: Request, res: Response) => {
  ch(Person.getPersonByIdWithFilter, (req: Request, res: Response) => {
    return [req.params.id]; 
  }, 404)(req, res, null);
});

persons.get('/identifier/:identityValue', (req: Request, res: Response) => {
  ch(Person.getPersonByIdentifier, (req: Request, res: Response) => {
    return [['personalNumber', 'identityCard'], req.params.identityValue]; 
  }, 404)(req, res, null);
});

persons.get('/personalNumber/:personalNumber', (req: Request, res: Response) => {
  ch(Person.getPerson, (req: Request, res: Response) => {
    return ['personalNumber', req.params.personalNumber]; 
  }, 404)(req, res, null);
});

persons.get('/identityCard/:identityCard', (req: Request, res: Response) => {
  ch(Person.getPerson, (req: Request, res: Response) => {
    return ['identityCard', req.params.identityCard]; 
  }, 404)(req, res, null);
});

persons.get('/domainUser/:domainUser', 
  ch(Person.getByDomainUserString, (req: Request) => {
    return [req.params.domainUser];
  })
);

persons.delete('/:id',
             PermissionMiddleware.hasAdvancedPermission, 
             ch(Person.discharge, (req: Request) => {
               return [req.params.id];
             }, 404));

// persons.put('/:id/personal',
//           PermissionMiddleware.hasPersonsPermission,
//           ch(Person.updatePerson, (req: Request, res: Response) => {
//             if (req.params.id !== req.body.id) return res.status(400).send('Person ID doesn\'t match');
//             const toUpdate = filterObjectByKeys(req.body, EDITABLE_FIELDS.concat('_id'));
//             return [req.params.id, toUpdate];
//           }, 404));

persons.put('/:id',
          PermissionMiddleware.hasAdvancedPermission,
          validatorMiddleware(atUpdateFieldCheck),
          ch(Person.updatePerson, (req: Request, res: Response) => {
            const personId = req.params.id;
            const fieldsToUpdate = req.body;
            return [personId, fieldsToUpdate];
          }, 404));

persons.put('/:id/assign',
          PermissionMiddleware.hasAdvancedPermission,
          ch(Person.assign, (req: Request, res: Response) => {
            const personID  = req.params.id;
            const groupID  = req.body.group;
            return [personID, groupID];
          }, 404));

persons.put('/:id/manage',
          PermissionMiddleware.hasAdvancedPermission,
          ch(Person.manage, (req: Request, res: Response) => {
            const personID  = req.params.id;
            const groupID  = req.body.group;
            return [personID, groupID];
          }, 404));

persons.put('/:id/resign',
          PermissionMiddleware.hasAdvancedPermission,
          ch(Person.resign, (req: Request, res: Response) => {
            const personID  = req.params.person;
            const groupID  = req.body.group;
            return [personID, groupID];
          }, 404));

export = persons;
