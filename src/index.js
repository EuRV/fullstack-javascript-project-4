import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

const convertUrlToPath = (link, ending = '') => {
  const url = new URL(link);
  const { hostname, pathname } = url;
  let basename = '';
  let dirname = '';
  if (pathname.length > 1) {
    basename = path.basename(pathname);
    dirname = `${path.dirname(pathname)}/`;
  }
  return path.join(hostname, dirname).replace(/[/\W_]/g, '-').concat(basename).concat(ending);
};

const getPageContentAndDownloadLinks = (data, link, pathToDir) => {
  const downloadLinks = [];
  const $ = cheerio.load(data);
  const pathToDownloadedAsset = $('img').attr('src');
  if (pathToDownloadedAsset) {
    const linkToDownloadedAsset = new URL(pathToDownloadedAsset, link).href;
    downloadLinks.push(linkToDownloadedAsset);
    const nameAsset = convertUrlToPath(linkToDownloadedAsset);
    const nameAssetsDir = path.basename(pathToDir);
    const pathToAssets = path.join(nameAssetsDir, nameAsset);
    $('img').attr('src', pathToAssets);
  }
  const pageContent = prettier.format($.html(), { parser: 'html' });
  return { pageContent, downloadLinks };
};

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
      const contentName = convertUrlToPath(downloadLinks);
      const [linkToDownloadedAsset] = downloadLinks;
      console.log(linkToDownloadedAsset);
      return axios.get(linkToDownloadedAsset, { responseType: 'arraybuffer' })
        .then((response) => fsp.writeFile(path.join(
          pathToDirAssets,
          contentName,
        ), response.data));
    })
    .then(() => pathToHtmlFile);
};

export default pageLoader;

// pageLoader('https://page-loader.hexlet.repl.co');
