import path from 'path';
import fsp from 'fs/promises';
import os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';

import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const host = 'https://page-loader.hexlet.repl.co';

beforeAll(() => {
  nock.disableNetConnect();
});

describe('page-loader', () => {
  let tempDir;
  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('get a response from the site', async () => {
    const downloadedPagePath = path.join(tempDir, 'page-loader-hexlet-repl-co.html');
    const correctAnswer = await fsp.readFile(getFixturePath('page.html'), 'utf-8');
    nock(host).get('/').reply(200, correctAnswer);
    const currentPagePath = await pageLoader(host, tempDir);
    const expectedResponse = await fsp.readFile(downloadedPagePath, 'utf-8');
    expect(expectedResponse).toBe(correctAnswer);
    expect(currentPagePath).toBe(downloadedPagePath);
  });
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
