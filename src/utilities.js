import path from 'path';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

const isUrl = (str) => {
  let url;
  try {
    url = new URL(str);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

const isCorrectHostname = (link1, link2) => {
  const url1 = new URL(link1);
  const url2 = new URL(link2);
  return url1.hostname === url2.hostname;
};

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
  const tags = { link: 'href', img: 'src', script: 'src' };
  const $ = cheerio.load(data);
  const downloadLinks = Object.entries(tags).reduce((acc, [tag, atr]) => {
    const pathToContent = $(tag).map((i, el) => {
      let url;
      const pathToDownloadedAsset = $(el).attr(atr);
      if (isUrl(pathToDownloadedAsset) && isCorrectHostname(link, pathToDownloadedAsset)) {
        url = pathToDownloadedAsset;
      }
      if (!isUrl(pathToDownloadedAsset)) {
        url = new URL(pathToDownloadedAsset, link).href;
      }
      if (url) {
        const nameAsset = convertUrlToPath(url);
        const nameAssetsDir = path.basename(pathToDir);
        const pathToAssets = path.join(nameAssetsDir, nameAsset);
        $(el).attr(atr, pathToAssets);
      }
      return url;
    }).toArray();
    return [...acc, ...pathToContent];
  }, []);
  const pageContent = prettier.format($.html(), { parser: 'html' });
  return { pageContent, downloadLinks };
};

export { convertUrlToPath, getPageContentAndDownloadLinks };
