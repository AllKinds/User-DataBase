process.env.NODE_ENV = 'test';
process.env.ENABLE_AUTH = 'true';
import { Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as forge from 'node-forge';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IPerson } from '../person/person.interface';
import { IOrganizationGroup } from '../group/organizationGroup/organizationGroup.interface';
import { OrganizationGroup } from '../group/organizationGroup/organizationGroup.controller';
import { AUTH_HEADER } from '../auth/jwt/jwtStrategy';

// import * as mocha from 'mocha';

dotenv.config({ path: '.env' });

(<any>mongoose).Promise = Promise;

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
 

export function generateCertificates() {
  // Generate a key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);
 
  // Create a certification request (CSR)  
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([{
    name: 'commonName',
    value: 'Kartoffel',
  }, {
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Virginia',
  }, {
    name: 'localityName',
    value: 'Blacksburg',
  }, {
    name: 'organizationName',
    value: 'Bla Bla',
  }, {
    shortName: 'OU',
    value: 'alB alB',
  }]);
  
  // Sign certification request
  csr.sign(keys.privateKey); 

  // Create certificate form certification request
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(2210936640000);
  cert.setSubject(csr.subject.attributes);
  cert.setIssuer(csr.subject.attributes);  

  // Sign certificate and set signature with sha512
  cert.sign(keys.privateKey, forge.md.sha512.create());

  // Convert certificate and key pair to PEM-format
  const pemCert = forge.pki.certificateToPem(cert);
  const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);
  const pemPublicKey = forge.pki.publicKeyToPem(keys.publicKey);  

  return {
    pemCert,
    pemPrivateKey,
    pemPublicKey,
  };
}

export function generateToken(payload: any, privateKey: string) {
  return jwt.sign(payload, privateKey, {
    issuer: config.auth.jwt.issuer,
    audience: config.auth.jwt.audience,
    expiresIn: '600000000', // take your time...
    algorithm: 'RS256',
  });
}

export function extractTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = jwt.decode(req.headers[AUTH_HEADER]);
  req.user = token;
  next();
}

export const mockAuthModule = {
  initialize: () => (req: Request, res: Response, next: NextFunction) => next(),
  middlewares: (req: Request, res: Response, next: NextFunction) => next(),
};

const mochaAsync = (func: Function) => {
  return async (done: Function) => {
    try {
      await func();
      done();
    } catch (err) {
      done(err);
    }
  };
};

export const dummyGroup: any = {
  name: 'uniqueAndSpecialName',
};

export async function createGroupForPersons(personsArr: IPerson[]) {
  const g = await OrganizationGroup.createOrganizationGroup(dummyGroup);
  for (const p of personsArr) {
    p.directGroup = g.id;
  }
  return personsArr;
}

export const expectError = async (func: Function, params: any[]) => {
  let isError = false;
  try {
    await func(...params);
  } catch (err) {
    err.should.exist;
    isError = true;
  }
  isError.should.be.true;
};

async function cleanDatabase(modelNames: string[]) {
  await mongoose.connection.dropDatabase();
  await Promise.all(modelNames.map(modelName =>
    mongoose.model(modelName).createIndexes()));
}

async function removeAllDocuments(modelNames: string[]) {
  await Promise.all(modelNames.map(modelName =>
    mongoose.model(modelName).deleteMany({}).exec()));
}

before(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
  const modelNames: string[] = mongoose.modelNames();
  await cleanDatabase(modelNames);
});

beforeEach(async () => {
  const modelNames: string[] = mongoose.modelNames();
  await removeAllDocuments(modelNames);
});

after((done) => {
  mongoose.disconnect();
  done();
});
