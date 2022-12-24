import path from 'path';
import fsp from 'fs/promises';
import os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';

import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const host = 'https://ru.hexlet.io';

beforeAll(() => {
  nock.disableNetConnect();
});

describe('positive case', () => {
  let tempDir;
  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('load a page without local links', async () => {
    const downloadedPagePath = path.join(tempDir, 'ru-hexlet-io.html');
    const correctAnswer = await fsp.readFile(getFixturePath('page-without-links.html'), 'utf-8');
    nock(host).get('/').reply(200, correctAnswer);
    const currentPagePath = await pageLoader(host, tempDir);
    const expectedResponse = await fsp.readFile(downloadedPagePath, 'utf-8');
    expect(expectedResponse).toBe(correctAnswer);
    expect(currentPagePath).toBe(downloadedPagePath);
  });

  test('load a page with local link', async () => {
    const downloadedPagePath = path.join(tempDir, 'ru-hexlet-io-courses.html');
    const downloadedCoursesPagePath = path.join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html');
    const downloadedCssPath = path.join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css');
    const downloadedImgPath = path.join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
    const downloadedScriptPath = path.join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js');
    const responcePageHtml = await fsp.readFile(getFixturePath('page-with-links.html'), 'utf-8');
    const correctPageHtml = await fsp.readFile(getFixturePath('page-with-local-links.html'), 'utf-8');
    const correctImg = await fsp.readFile(getFixturePath('nodejs.png'));
    const correctCss = await fsp.readFile(getFixturePath('application.css'), 'utf-8');
    const correctScript = await fsp.readFile(getFixturePath('script.js'), 'utf-8');
    nock(host)
      .get('/courses')
      .reply(200, responcePageHtml)
      .get('/assets/application.css')
      .reply(200, correctCss)
      .get('/courses')
      .reply(200, responcePageHtml)
      .get('/assets/professions/nodejs.png')
      .reply(200, correctImg)
      .get('/packs/js/runtime.js')
      .reply(200, correctScript);
    await pageLoader('https://ru.hexlet.io/courses', tempDir);
    const expectedPage = await fsp.readFile(downloadedPagePath, 'utf-8');
    const expectedCoursesPage = await fsp.readFile(downloadedCoursesPagePath, 'utf-8');
    const expectedCss = await fsp.readFile(downloadedCssPath, 'utf-8');
    const expectedImg = await fsp.readFile(downloadedImgPath);
    const expectedScript = await fsp.readFile(downloadedScriptPath, 'utf-8');
    expect(expectedPage).toBe(correctPageHtml);
    expect(expectedCss).toBe(correctCss);
    expect(expectedCoursesPage).toBe(responcePageHtml);
    expect(expectedImg.compare(correctImg)).toBe(0);
    expect(expectedScript).toBe(correctScript);
  });

  afterAll(() => {
    nock.cleanAll();
  });
});

describe('negative case', () => {
  let tempDir;
  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('error when downloading assets', async () => {
    const responcePageHtml = await fsp.readFile(getFixturePath('page-with-links.html'), 'utf-8');

    nock(host)
      .get('/courses')
      .reply(200, responcePageHtml)
      .get('/assets/application.css')
      .reply(404)
      .get('/courses')
      .reply(404)
      .get('/assets/professions/nodejs.png')
      .reply(404)
      .get('/packs/js/runtime.js')
      .reply(404);

    await expect(pageLoader('https://ru.hexlet.io/courses', tempDir)).rejects.toThrow();
  });

  test.each([404, 500])('error response (%s)', async (status) => {
    const url = new URL(`/${status}`, host);

    nock(host)
      .get(url.pathname)
      .reply(status);
    await expect(pageLoader(url.href, tempDir)).rejects.toThrow();
  });

  test('network failure', async () => {
    const pathName = '/network';
    const url = new URL(pathName, host);

    nock(host)
      .get(pathName)
      .replyWithError('network error');

    await expect(pageLoader(url.href, tempDir)).rejects.toThrow('network error');
  });

  test('correctness of the path to save', async () => {
    const dir = '/sys';

    nock(host)
      .get('/')
      .reply(200, '');

    await expect(pageLoader(host, dir)).rejects.toThrow(`EACCES: permission denied, mkdir '${dir}/ru-hexlet-io_files'`);
  });

  afterAll(() => {
    nock.cleanAll();
  });
});

afterAll(() => {
  nock.enableNetConnect();
});
