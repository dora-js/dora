import request from 'request';
import dora from '../src/index';
import { join } from 'path';
import expect from 'expect';

const port = 12346;

describe('index', () => {

  before(done => {
    dora({
      plugins: [
        './plugin-sync?affix=s',
        './plugin-async?affix=a',
        './plugin-generator?affix=g',
      ],
      port,
      cwd: join(__dirname, 'fixtures/plugin-run'),
      verbose: true,
    }, done);
  });

  it('plugin-sync', (done) => {
    request(`http://localhost:${port}/sync`, (err, res, body) => {
      expect(body).toEqual('sync-s');
      done();
    });
  });

  it('plugin-async', (done) => {
    request(`http://localhost:${port}/async`, (err, res, body) => {
      expect(body).toEqual('s-async-a');
      done();
    });
  });

  it('plugin-generator', (done) => {
    request(`http://localhost:${port}/generator`, (err, res, body) => {
      expect(body).toEqual('generator-g');
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
