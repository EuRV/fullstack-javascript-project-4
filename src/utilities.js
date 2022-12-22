import path from 'path';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

const isCorrectHostname = (link1, link2) => link1.hostname === link2.hostname;

const convertUrlToPath = (url, ending = '') => {
  const { hostname, pathname } = url;
  let basename = '';
  let dirname = '';
  if (pathname.length > 1) {
    basename = path.basename(pathname);
    dirname = `${path.dirname(pathname)}/`;
  }
  return path.join(hostname, dirname).replace(/[/\W_]/g, '-').concat(basename).concat(ending);
};

const getPageContentAndDownloadLinks = (data, url, pathToDir) => {
  const tags = { link: 'href', img: 'src', script: 'src' };
  const $ = cheerio.load(data);
  const downloadLinks = Object.entries(tags).reduce((acc, [tag, atr]) => {
    const pathToContent = $(tag).map((i, el) => {
      let downloadPaths;
      const pathToDownloadedAsset = $(el).attr(atr);
      const linkToAsset = new URL(pathToDownloadedAsset, url);
      if (isCorrectHostname(url, linkToAsset)) {
        const nameAsset = !path.extname(linkToAsset.pathname) ? convertUrlToPath(linkToAsset, '.html') : convertUrlToPath(linkToAsset);
        const pathToAsset = path.join(pathToDir, nameAsset);
        $(el).attr(atr, pathToAsset);
        downloadPaths = { linkToAsset, pathToAsset };
      }
      return downloadPaths;
    }).toArray();
    return [...acc, ...pathToContent];
  }, []);
  const pageContent = prettier.format($.html(), { parser: 'html' });
  return { pageContent, downloadLinks };
};

export { convertUrlToPath, getPageContentAndDownloadLinks };
