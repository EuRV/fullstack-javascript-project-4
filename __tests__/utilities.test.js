import path from 'path';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { getPageContentAndDownloadLinks } from '../src/utilities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const link = 'https://ru.hexlet.io/courses';
const pathToDir = '/home/eurv/learning_project/hexlet/fullstack-javascript-project-4/ru-hexlet-io-courses_files';

test('getPageContentAndDownloadLinks', async () => {
  const originalHtml = await fsp.readFile(getFixturePath('page-with-links.html'), 'utf-8');
  const expectedHtml = await fsp.readFile(getFixturePath('page-with-local-links.html'), 'utf-8');
  const { pageContent, downloadLinks } = getPageContentAndDownloadLinks(
    originalHtml,
    link,
    pathToDir,
  );
  expect(pageContent).toEqual(expectedHtml);
  expect(downloadLinks.length).toBe(4);
});
