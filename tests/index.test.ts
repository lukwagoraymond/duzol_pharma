import * as mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index';
import 'dotenv/config';

// Configure Chai
chai.use(chaiHttp);
const expect = chai.expect;

describe('Backend API HTTP Integration Tests', function() {
  describe('GET /admin/', function() {
    it('should return a json response on call', function(done) {
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
});