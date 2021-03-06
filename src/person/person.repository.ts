import { PersonModel as Person } from './person.model';
import { IPerson, IDomainUser, IDomainUserIdentifier, PictureType } from './person.interface';
import { RepositoryBase, ICollection } from '../helpers/repository';
import * as _ from 'lodash';
import { Types } from 'mongoose';
import  * as consts  from '../config/db-enums';
import { config } from '../config/config';

export class PersonRepository extends RepositoryBase<IPerson> {
  constructor() {
    super(Person);
  }

  getMembersOfGroups(organizationGroupsIDS: string[]): Promise<IPerson[]> {
    return this.find({ directGroup: { $in: organizationGroupsIDS } });
  }

  findByDomainUser(domainUser: IDomainUserIdentifier, populate?: any, select?: any): Promise<IPerson> {
    return this.findOne({ domainUsers: { $elemMatch: { name: domainUser.name, domain: domainUser.domain } } }, populate, select);
  }

  findByDomainUserName(name: string, populate?: any, select?: any): Promise<IPerson> {
    return this.findOne({ 'domainUsers.name': name }, populate, select);
  }

  /**
   * find a person with a domain user that have the given name and one of the given domains
   * @param domainUserName name of the domain user
   * @param domains array of possible domains
   * @param populate
   * @param select 
   */
  findByMultiDomainUser(domainUserName: string, domains: string[], populate?: any, select?: any): Promise<IPerson> {
    const matchQuery = {
      name: domainUserName,
      domain: { $in: domains },
    };
    return this.findOne({ domainUsers: { $elemMatch: matchQuery } }, populate, select);
  }

  /**
   * updates a domain user for a specific person, with many possible domains 
   * @param personId person id
   * @param domainUseName the name part of the domain user to be updated
   * @param domains the possible domains of the domain user to be updated
   * @param updateFields domain user fields with the new values to set
   * @param populate 
   * @param select 
   */
  updateMultiDomainUser(personId: string, domainUseName: string, domains: string[], 
    updateFields: Partial<IDomainUser>, populate?: any, select?: any): Promise<IPerson> {
    const opts = { new: true, runValidators: true, context: 'query' };    
    const querySet = _.mapKeys(updateFields, (v, k) => `domainUsers.$.${k}`);
    const matchQuery = {
      name: domainUseName,
      domain: { $in: domains },
    };
    let query = Person.findOneAndUpdate(
      { _id: personId, domainUsers: { $elemMatch: matchQuery } },
      { $set: { ...querySet } },
      opts
    );
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);

    return query.exec().then(res => res ? res.toObject() : res);
  }

  /**
   * deletes a domain user from a specific person, with many possible domains
   * @param personId person id
   * @param domainUserName the name part of the domain user to delete
   * @param domains the possible domains of the domain user to delete
   * @param populate 
   * @param select 
   */
  deleteMultiDomainUser(personId: string, domainUserName: string, domains: string[], 
    populate?: any, select?: any): Promise<IPerson> {
    const matchQuery = {
      domainUsers: {
        name: domainUserName,
        domain: { $in: domains },
      },
    };
    let query = Person.findByIdAndUpdate({ _id: personId }, { $pull: matchQuery }, { new: true });
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);

    return query.exec().then(res => res ? res.toObject() : res);
  }
  /**
  * inserts new domain user to a specific person
  * @param personId person id
  * @param domainUser domain user object to insert
  */
  insertDomainUser(personId: string, domainUser: IDomainUser): Promise<IPerson> {
    const opts = { new: true, runValidators: true, context: 'query' };    
    return Person.findOneAndUpdate({ _id: personId }, { $push: { domainUsers: domainUser } }, opts).exec()
      .then(res => res ? res.toObject() : res);
  }

  /**
   * Returns the raw (unfiltered) 'pictures' field of a person.
   * @param personIdentifier personalNumber or identityCard or id
   */
  async getRawPictures(personIdentifier: string): Promise<{
    profile?: { 
      url: string;
      meta: {
        path: string;
        takenAt: Date;
        format?: string;
      }
    }
  }> {
    const query = Types.ObjectId.isValid(personIdentifier) ? 
      this._model.findById(personIdentifier) : 
      this._model.findOne({ $or: [
        { identityCard: personIdentifier }, 
        { personalNumber: personIdentifier },
      ]});
    const rawPerson = await query.select('pictures').exec() as any;
    return rawPerson.pictures || {};
  }
}
