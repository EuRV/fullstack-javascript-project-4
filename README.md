### Hexlet tests and linter status:
[![Actions Status](https://github.com/EuRV/fullstack-javascript-project-4/workflows/hexlet-check/badge.svg)](https://github.com/EuRV/fullstack-javascript-project-4/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/479e9ff745f4c881dac1/maintainability)](https://codeclimate.com/github/EuRV/fullstack-javascript-project-4/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/479e9ff745f4c881dac1/test_coverage)](https://codeclimate.com/github/EuRV/fullstack-javascript-project-4/test_coverage)
[![Node CI](https://github.com/EuRV/fullstack-javascript-project-4/actions/workflows/nodejs.yml/badge.svg)](https://github.com/EuRV/fullstack-javascript-project-4/actions/workflows/nodejs.yml)
# Page Loader
## About the Project
This is a training project. The utility loads the HTML page and resources.

The capability of the utility:
1) Specify the local directory for loading the page (by default it will be loaded into the current directory).
2) Specify the address of the page you want to download. The application will download an html file along with resources (images, styles, scripts), replacing the links with local ones.

## Getting started
- Clone the repository
```cmd
git clone https://github.com/EuRV/fullstack-javascript-project-4
```
- Install dependencies
```cmd
cd fullstack-javascript-project-4
make install
```
- Install project
```cmd
make link
```

## Usage
```cmd
[...@fedora fullstack-javascript-project-4]$ page-loader -h
Usage: page-loader [options] <link>

Downloads the page from the web and puts it in the specified directory

Options:
  -V, --version        output the version number
  -o, --output [path]  output path (default: "/...")
  -h, --help           display help for command
```
```cmd
page-loader -o page-loader https://page-loader.hexlet.repl.co
```
### or (the current directory will be selected)
```cmd
page-loader https://page-loader.hexlet.repl.co
```
## Example
[![asciicast](https://asciinema.org/a/kLRy5gv04bG9ogHH8u84uAiXU.svg)](https://asciinema.org/a/kLRy5gv04bG9ogHH8u84uAiXU)