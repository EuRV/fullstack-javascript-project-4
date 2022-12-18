import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { convertUrlToPath, getPageContentAndDownloadLinks } from './utilities.js';

const pageLoader = (link, outputPath = cwd()) => {
  const nameAssetFolder = convertUrlToPath(link, '_files');
  const pathToDirAssets = path.join(outputPath, nameAssetFolder);

  const fileName = convertUrlToPath(link, '.html');
  const pathToHtmlFile = path.join(outputPath, fileName);

  let downloadLinks;
  let pageContent;
  return axios.get(link, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      ({ pageContent, downloadLinks } = getPageContentAndDownloadLinks(
        data,
        link,
        nameAssetFolder,
      ));
      fsp.writeFile(pathToHtmlFile, pageContent);
    })
    .then(() => {
      if (downloadLinks.length === 0) {
        return null;
      }
      fsp.mkdir(pathToDirAssets, { recursive: true });
      return Promise.all(downloadLinks.map((downloadLink) => {
        const contentName = convertUrlToPath(downloadLink);
        return axios.get(downloadLink, { responseType: 'arraybuffer' })
          .then((response) => fsp.writeFile(path.join(
            pathToDirAssets,
            contentName,
          ), response.data));
      }));
    })
    .then(() => pathToHtmlFile);
};

export default pageLoader;

// pageLoader('https://page-loader.hexlet.repl.co');
