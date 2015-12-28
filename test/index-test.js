import request from 'request';
import dora from '../src/index';
import { join } from 'path';
import expect from 'expect';

const port = 12346;

describe('index', () => {

  before(done => {
    dora({
      plugins: [
        './plugin-a',
      ],
      port,
      cwd: join(__dirname, 'fixtures/plugin-run'),
      verbose: true,
    }, done);
  });

  it('plugin-a middleware', (done) => {
    request(`http://localhost:${port}/foo`, (err, res, body) => {
      expect(body).toEqual('foo');
      done();
    });
  });

  it('static', (done) => {
    request(`http://localhost:${port}/index.js`, (err, res, body) => {
      expect(body.trim()).toEqual('console.log(\'index\');');
      done();
    });
  });

  it('serve index', (done) => {
    request(`http://localhost:${port}/`, (err, res, body) => {
      expect(body.indexOf('<title>listing directory /</title>') > -1).toExist();
      done();
    });
  });

});
