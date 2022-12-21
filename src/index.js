import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { convertUrlToPath, getPageContentAndDownloadLinks } from './utilities.js';

const nameSpaceLog = 'page-loader';

const log = debug(nameSpaceLog);

debug('booting %o', nameSpaceLog);

const loadAndSaveFiles = (arrayPathsAndLinks, pathToCurrentDir) => (
  Promise.all(arrayPathsAndLinks.map(({ linkToAsset, pathToAsset }) => {
    log('__load file: %o', linkToAsset.href);
    return axios.get(linkToAsset, { responseType: 'arraybuffer' })
      .then(({ data }) => {
        log('__save file from: %o', linkToAsset.href, 'in: ', pathToAsset);
        return fsp.writeFile(path.join(pathToCurrentDir, pathToAsset), data);
      }, ((error) => {
        log('__fail load: %o', linkToAsset.href);
        throw error;
      }));
  }))
);

const pageLoader = (link, outputPath = cwd()) => {
  log('---- start load %o ----', nameSpaceLog);
  log('pageLink: %o', link);
  log('outputPath: %o', outputPath);

  const url = new URL(link);
  const nameAssetsFolder = convertUrlToPath(url, '_files');
  const pathToDirAssets = path.join(outputPath, nameAssetsFolder);
  const fileName = convertUrlToPath(url, '.html');
  const pathToHtmlFile = path.join(outputPath, fileName);
  let pageData;

  log('load html: %o', link);
  return axios.get(link, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      pageData = getPageContentAndDownloadLinks(
        data,
        url,
        nameAssetsFolder,
      );
    })
    .then(() => {
      log('creating a folder: %o', pathToDirAssets);
      return fsp.mkdir(pathToDirAssets, { recursive: true });
    })
    .then(() => {
      log('save html: %o', pathToHtmlFile);
      return fsp.writeFile(pathToHtmlFile, pageData.pageContent);
    })
    .then(() => {
      if (pageData.downloadLinks.length === 0) {
        return null;
      }
      return loadAndSaveFiles(pageData.downloadLinks, outputPath);
    })
    .then(() => log('---- finish load %o ----', nameSpaceLog))
    .then(() => pathToHtmlFile)
    .catch((error) => {
      log(`error: '${error.message}'`);
      log('---- error load %o ----', nameSpaceLog);
      throw error.message;
    });
};

export default pageLoader;

// pageLoader('https://page-loader.hexlet.repl.co', '/sys');
