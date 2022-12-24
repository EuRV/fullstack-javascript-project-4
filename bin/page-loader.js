#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .version('1.0.0', '-V, --version', 'output the version number')
  .description('Downloads the page from the web and puts it in the specified directory')
  .option('-o, --output [path]', 'output path', process.cwd())
  .arguments('<link>')
  .action((link, option) => pageLoader(link, option.output)
    .then((pathToFile) => console.log(pathToFile))
    .catch((error) => {
      console.error('Error: %o', error.message);
      process.exit(1);
    }));

program.parse(process.argv);
