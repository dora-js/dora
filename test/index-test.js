import request from 'request';
import dora from '../src/index';
import { join } from 'path';
import expect from 'expect';

const port = 12346;

describe.only('index', () => {

  before(done => {
    dora({
      plugins: [],
      port,
      cwd: join(__dirname, 'fixtures/plugin-run'),
    });
  });

  it('normal', () => {
    expect(1).toEqual(1);
  });

});
