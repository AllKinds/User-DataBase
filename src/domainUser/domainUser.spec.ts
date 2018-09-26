import * as chai from 'chai';
import { IDomainUser } from './domainUser.interface';
import { DomainUserController as Users } from './domainUser.controller';
import { expectError } from '../helpers/spec.helper';
import { userFromString } from './domainUser.utils';

const should = chai.should();
const expect = chai.expect;

const dbIdExample = ['5b50a76713ddf90af494de32'];

const userExample: IDomainUser = {
  name: 'fuckYou',
  domain: 'rabiran',
};


describe('DomainUsers', () => {
  describe('#createDomainUser', () => {
    it('should create domain user', async () => {
      const user = await Users.create(userExample);
      user.should.exist;
      user.should.have.property('id');
      user.should.have.property('name', userExample.name);
      user.should.have.property('domain', userExample.domain);
      user.should.have.property('fullString', `${userExample.name}@${userExample.domain}`);
    });

    it('should throw an error when creating an existing user', async () => {
      const sameUser = {
        name: 'fuckYou',
        domain: 'rabiran',
      };
      await Users.create(userExample);
      await expectError(Users.create, [sameUser]);
    });

    it('should create the user from the string representation', async () => {
      const name = 'someuser123', domain = 'somedomain';
      const userString = `${name}@${domain}`;
      const userObj = userFromString(userString);
      userObj.should.have.property('name', name);
      userObj.should.have.property('domain', domain);
      const user = await Users.create(userObj);
      user.should.exist;
      user.should.have.property('name', name);
      user.should.have.property('domain', domain);
      user.should.have.property('fullString', userString);
      user.should.have.property('id');
    });

    it('should throw an error when trying to construct user object fron illegal string', () => {
      const illegalString1 = 'withoutSeperator', illegalString2 = 'two@shit@seperators',
        illegalString3 = '@noName', illegalString4 = 'noDomain@';
      expect(userFromString.bind(null, illegalString1)).to.throw();
      expect(userFromString.bind(null, illegalString2)).to.throw();
      expect(userFromString.bind(null, illegalString3)).to.throw();
      expect(userFromString.bind(null, illegalString4)).to.throw();
    });

  });

  describe('#getAll', () => {
    it('should be empty when there are no users', async () => {
      const users = await Users.getAll();
      users.should.be.an('array');
      users.should.have.lengthOf(0);
    });

    it('should get all the users', async () => {
      await Users.create(userExample);
      const users = await Users.getAll();
      users.should.be.an('array');
      users.should.have.lengthOf(1);
    });
  });

  describe('#getById', () => {
    it('should get the specified user by its ID', async () => {
      const createdUser = await Users.create(userExample);
      const user = await Users.getById(createdUser.id);
      user.should.have.property('name', createdUser.name);
      user.should.have.property('domain', createdUser.domain);
      user.should.have.property('fullString', `${createdUser.name}@${createdUser.domain}`);
    });
  });

  describe('#getByFullString', () => {
    it('should get the user by it\'s full string', async () => {
      await Users.create(userExample);
      const user = await Users.getByFullString(`${userExample.name}@${userExample.domain}`);
      user.should.exist;
      user.should.have.property('name', userExample.name); 
      user.should.have.property('domain', userExample.domain);
    });

    it('should throw error when there is not user with matching full string', async () => {
      await Users.create(userExample);
      await expectError(Users.getByFullString, [`other@domain`]);
    });
  });

  describe('#delete', () => {
    it('should delete the specified user', async () => {
      const createdUser = await Users.create(userExample);
      const res = await Users.delete(createdUser.id);
      res.should.have.property('ok', 1);
      res.should.have.property('n', 1);
    });
  });
});
