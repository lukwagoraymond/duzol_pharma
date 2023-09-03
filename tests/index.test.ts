const sinon = require('sinon');
import { execFileSync } from 'child_process';
import chai from 'chai';
import chaiHttp from 'chai-http';
import startServer from '../src/index';
import dbConnection from '../src/services/Database';
import { Vendor } from '../src/models';
import 'dotenv/config';

// Configure Chai
chai.use(chaiHttp);
const expect = chai.expect;
const app = startServer();
process.env.NODE_ENV === 'test'

describe('Backend API HTTP Integration Tests', () => {
  // Mocha Hooks to clean Database before the test Suite
  describe('GET /admin/', () => {
    it('should return a json response on call', (done) => {
      chai.request(app)
      .get('/admin/')
      .end((err, res) => {
        if (res) {
          expect(res.body).to.have.property('message').that.is.equal('Hello from Admin');
          expect(res.body).to.be.an("object");
        }
        done();
      }); 
    });
    it('should return json list of vendors', () => {
      //
    });
    it('should return vendor object searched by ID', () => {
      //
    });
    it('should return a list of transactions done', () => {
      //
    });
    it('should return transaction details search by ID', () => {
      //
    });
    it('should return a list of delivery users', () => {
      //
    })
  });

  describe('POST /admin/', () => {
    before(async() => {
      try {
        await Vendor.deleteMany({});
      } catch (err) {
        console.error(err);
      }
    });
    // Mocha Hooks to clean Database after the test Suite
    after(async() => {
      try {
        await Vendor.deleteMany({});
      } catch (err) {
        console.error(err);
      }
    });
    let testVendor = {
      name: "Test Pharmacy Ltd",
      ownerName: "Pesudo Name",
      productType: [
          "Test-Vitamins",
          "Test-Drugs"
      ],
      pincode: "0045678",
      address: "Kigali, Rwanda",
      phone: "256772340179",
      email: "test123@gmail.com",
      password: "test123",
      serviceAvailable: false,
      coverImages: [],
      products: [],
      rating: 3
  }
    it('should create a vendor user account profile', (done) => {
    chai.request(app)
    .post('/admin/vendor')
    .send(testVendor)
    .end((err, res) => {
      if (err) {
        expect(err).to.have.status(400);
        expect(err.body).to.be.an('object');
        expect(err.body).to.have.property('error').that.is.equal("Failed to create new vendor");
      }
      if (res) {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.vendor).with.lengthOf(24);
      }
      done();
    });
    });
    it("shouldn't accept vendor user already exists in database", (done) => {
      chai.request(app)
      .post('/admin/vendor')
      .send(testVendor)
      .end((res) => {
        if(res) {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('error').that.is.equal("Vendor already exists with this EmailID");
        };
        done();
      });
    });
    it.skip('should register a vendor with valid credentials', () => {
      //
    });
  });

  describe('GET /vendor/', function() {
    it('should return a json response on call', function(done) {
      chai.request(app)
      .get('/vendor/')
      .end((err, res) => {
        if (res) {
          expect(res.body).to.have.property('message').that.is.equal('Hello from Vendor');
          expect(res.body).to.be.an("object");
        }
        done();
      });
    });
  });

  describe.skip('npm run dev', function() {
    it('should produce expected output on terminal', function() {
      const dbConnectionStub = sinon.stub(dbConnection());
      const consoleSpy = sinon.spy(console, 'log');
      const customEnv = {
        NODE_ENV: 'dev'
      };
      const ttt = new Array();
      ttt.push('inherit');
      const options = {
        env: customEnv,
        cwd: '/home/raymond/ALX_Dossier/duzol_pharma_v1',
        stdio: ttt
      };
      //const expectedOutput = execSync('nodemon --exec node_modules/ts-node src/index.ts', options);
      const expectedOutput = execFileSync('nodemon', ['src/index.ts'], options);
      expect(consoleSpy.calledOnce).to.be.true;
      dbConnectionStub.restore();
      consoleSpy.restore();
    });
  });
});