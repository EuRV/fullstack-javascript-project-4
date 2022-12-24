import axios from 'axios';
// import 'axios-debug-log';
import debug from 'debug';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import Listr from 'listr';
import { convertUrlToPath, getPageContentAndDownloadLinks } from './utilities.js';

const nameSpaceLog = 'page-loader';
const log = debug(nameSpaceLog);
debug('booting %o', nameSpaceLog);

const loadAndSaveFiles = ({ linkToAsset, pathToAsset }, pathToCurrentDir) => {
  log('__load file: %o', linkToAsset.href);
  return axios.get(linkToAsset, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      log('__save file from: %o', linkToAsset.href, 'in: ', pathToAsset);
      return fsp.writeFile(path.join(pathToCurrentDir, pathToAsset), data);
    })
    .catch((error) => {
      log('__fail load: %o', linkToAsset.href);
      throw error;
    });
};

const pageLoader = (link, outputPath = cwd()) => {
  log('---- start load %o ----', nameSpaceLog);
  log('pageLink: %o', link);
  log('outputPath: %o', outputPath);

  const url = new URL(link);
  const nameAssetsFolder = convertUrlToPath(url, '_files');
  const pathToDirAssets = path.resolve(outputPath, nameAssetsFolder);
  const fileName = convertUrlToPath(url, '.html');
  const pathToHtmlFile = path.resolve(outputPath, fileName);
  let pageData;

  log('load html: %o', link);
  return axios.get(link, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      pageData = getPageContentAndDownloadLinks(data, url, nameAssetsFolder);
    })
    .then(() => fsp.access(pathToDirAssets).catch(() => {
      log('creating a folder: %o', pathToDirAssets);
      return fsp.mkdir(pathToDirAssets);
    }))
    .then(() => {
      log('save html: %o', pathToHtmlFile);
      return fsp.writeFile(pathToHtmlFile, pageData.pageContent);
    })
    .then(() => {
      if (pageData.downloadLinks.length === 0) {
        return null;
      }
      const getTask = (asset) => (
        {
          title: `${asset.linkToAsset}`,
          task: () => loadAndSaveFiles(asset, outputPath),
        }
      );
      return new Listr(
        pageData.downloadLinks.map(getTask),
        { concurrent: true, exitOnError: false },
      ).run();
    })
    .then(() => log('---- finish load %o ----', nameSpaceLog))
    .then(() => pathToHtmlFile)
    .catch((error) => {
      log(`error: '${error.message}'`);
      log('---- error load %o ----', nameSpaceLog);
      throw error;
    });
};

export default pageLoader;
