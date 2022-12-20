import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { convertUrlToPath, getPageContentAndDownloadLinks } from './utilities.js';

const loadAndSaveFiles = (promises, pathToCurrentDir) => (
  Promise.all(promises.map(({ linkToAsset, pathToAsset }) => (
    axios.get(linkToAsset, { responseType: 'arraybuffer' })
      .then((response) => fsp.writeFile(path.join(pathToCurrentDir, pathToAsset), response.data))
  )))
);

const pageLoader = (link, outputPath = cwd()) => {
  const nameAssetsFolder = convertUrlToPath(link, '_files');
  const pathToDirAssets = path.join(outputPath, nameAssetsFolder);
  const fileName = convertUrlToPath(link, '.html');
  const pathToHtmlFile = path.join(outputPath, fileName);

  return axios.get(link, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      const { pageContent, downloadLinks } = getPageContentAndDownloadLinks(
        data,
        link,
        nameAssetsFolder,
      );
      fsp.writeFile(pathToHtmlFile, pageContent);
      return downloadLinks;
    })
    .then((downloadLinks) => {
      if (downloadLinks.length === 0) {
        return null;
      }
      fsp.mkdir(pathToDirAssets, { recursive: true });
      return loadAndSaveFiles(downloadLinks, outputPath);
    })
    .then(() => pathToHtmlFile);
};

export default pageLoader;
