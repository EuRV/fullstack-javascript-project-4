import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { convertUrlToPath, getPageContentAndDownloadLinks } from './utilities.js';

const loadAndSaveFiles = (arrayPathsAndLinks, pathToCurrentDir) => (
  Promise.all(arrayPathsAndLinks.map(({ linkToAsset, pathToAsset }) => (
    axios.get(linkToAsset, { responseType: 'arraybuffer' })
      .then((response) => fsp.writeFile(path.join(pathToCurrentDir, pathToAsset), response.data))
  )))
);

const pageLoader = (link, outputPath = cwd()) => {
  const url = new URL(link);
  const nameAssetsFolder = convertUrlToPath(url, '_files');
  const pathToDirAssets = path.join(outputPath, nameAssetsFolder);
  const fileName = convertUrlToPath(url, '.html');
  const pathToHtmlFile = path.join(outputPath, fileName);

  return axios.get(link, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      const { pageContent, downloadLinks } = getPageContentAndDownloadLinks(
        data,
        url,
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
