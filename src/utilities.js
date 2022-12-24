import path from 'path';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

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
    const pathToContent = $(tag).map((i, el) => $(el)).toArray()
      .filter(($element) => $element.attr(atr) !== undefined)
      .map(($element) => ({ $element, linkToAsset: new URL($element.attr(atr), url) }))
      .filter(({ linkToAsset }) => linkToAsset.hostname === url.hostname)
      .map(({ $element, linkToAsset }) => {
        const nameAsset = !path.extname(linkToAsset.pathname) ? convertUrlToPath(linkToAsset, '.html') : convertUrlToPath(linkToAsset);
        const pathToAsset = path.join(pathToDir, nameAsset);
        $element.attr(atr, pathToAsset);
        return { linkToAsset, pathToAsset };
      });
    return [...acc, ...pathToContent];
  }, []);
  const pageContent = prettier.format($.html(), { parser: 'html' });
  return { pageContent, downloadLinks };
};

export { convertUrlToPath, getPageContentAndDownloadLinks };
