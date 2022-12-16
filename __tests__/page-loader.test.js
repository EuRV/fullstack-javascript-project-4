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

  test('load a page without local links', async () => {
    const downloadedPagePath = path.join(tempDir, 'page-loader-hexlet-repl-co.html');
    const correctAnswer = await fsp.readFile(getFixturePath('page-without-links.html'), 'utf-8');
    nock(host).get('/').reply(200, correctAnswer);
    const currentPagePath = await pageLoader(host, tempDir);
    const expectedResponse = await fsp.readFile(downloadedPagePath, 'utf-8');
    expect(expectedResponse).toBe(correctAnswer);
    expect(currentPagePath).toBe(downloadedPagePath);
  });

  test('load a page with local link', async () => {
    const downloadedPagePath = path.join(tempDir, 'page-loader-hexlet-repl-co.html');
    const downloadedAssetPath = path.join(tempDir, 'page-loader-hexlet-repl-co_files/page-loader-hexlet-repl-co-assets-professions-nodejs.png');
    const responcePageHtml = await fsp.readFile(getFixturePath('page-with-links.html'), 'utf-8');
    const correctPageHtml = await fsp.readFile(getFixturePath('page-with-local-links.html'), 'utf-8');
    const correctImg = await fsp.readFile(getFixturePath('nodejs.png'));
    nock(host).get(/.*/).reply(200, responcePageHtml);
    nock(host).get('/assets/professions/nodejs.png').reply(200, correctImg);
    const currentPagePath = await pageLoader(host, tempDir);
    const expectedPage = await fsp.readFile(downloadedPagePath, 'utf-8');
    const expectedImg = await fsp.readFile(downloadedAssetPath);
    expect(expectedPage).toBe(correctPageHtml);
    expect(expectedImg.compare(correctImg)).toBe(0);
    expect(currentPagePath).toBe(downloadedPagePath);
  });
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
