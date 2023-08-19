import chai from 'chai';
import chaiHttp from 'chai-http';
const { helloTest } = require ('../src/index');

//chai.use(chaiHttp);
const expect = chai.expect;

describe('First Sample Test', function () {
  it('should return true', function (done) {
    const result = helloTest();
    expect(result).to.eql(true);
    done();
  });
});
