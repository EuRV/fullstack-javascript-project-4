// import axios from 'axios';
// import fsp from 'fs/promises';
import path from 'path';
// import { cwd } from 'process';
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

export { convertUrlToPath, getPageContentAndDownloadLinks };

// const content = Object.entries(tags).reduce((acc, [tag, atr]) => {
//   const pathToContent = $(tag).map((i, el) => $(el).attr(atr))
//     .toArray();
//   return [...acc, ...pathToContent];
// }, []);
