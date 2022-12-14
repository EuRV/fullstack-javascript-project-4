import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import { cwd } from 'process';

const generateFileName = (link) => {
  const url = new URL(link);
  return `${url.hostname}${url.pathname}`
    .replace(/^www.|\/$/g, '')
    .replace(/\.|\//g, '-')
    .concat('.html');
};

const pageLoader = (link, outputPath = cwd()) => {
  const fileName = generateFileName(link);
  const pathToFile = path.resolve(outputPath, fileName);
  return axios.get(link)
    .then((response) => fsp.writeFile(pathToFile, response.data))
    .then(() => pathToFile);
};

export default pageLoader;
