const execSync = require('child_process').execSync;
const inInstall = require('in-publish').inInstall;
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs-extra');
const globby = require('globby');
const Promise = require('bluebird');
const sass = require('node-sass');

if (inInstall()) process.exit(0);

const babelPath = path.resolve(__dirname, '../node_modules/.bin/babel');
const dirs = ['components', 'internal'];
const outputs = ['cjs', 'es'];
const rootDir = path.resolve(__dirname, '../');

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  });

const compile = (dirs, type) => {
  dirs.forEach(dir => {
    exec(`${babelPath} ${dir} --out-dir ${type}/${dir} --ignore __tests__`, {
      BABEL_ENV: type,
    });
  });

  exec(`${babelPath} index.js -d ${type}`, {
    BABEL_ENV: type,
  });
};

const copySass = () => {
  const allCopy = [];

  globby([
    `${rootDir}/{components,internal,/**/*.scss`,
    'index.scss',
  ]).then(paths => {
    paths.forEach(path => {
      if (path.includes('index.scss')) {
        const newLocation = path.replace('index.scss', 'scss/index.scss');
        allCopy.push(fs.copy(path, newLocation));
      } else {
        const regex = new RegExp('(components|internal)');
        const newLocation = path.replace(regex, 'scss/$1');
        allCopy.push(fs.copy(path, newLocation));
      }
    });

    Promise.all(allCopy).then(() => {
      console.log('Done');
      return;
    });
  });
};

console.log('Deleting old build folders ...');

rimraf(`${rootDir}/cjs`, err => {
  if (err) throw err;

  rimraf(`${rootDir}/es`, err => {
    if (err) throw err;

    rimraf(`${rootDir}/es`, err => {
      if (err) throw err;

      console.log('Building CommonJS modules ...');
      compile(dirs, 'cjs');

      console.log('\nBuilding ES modules ...');
      compile(dirs, 'es');

      console.log('\nCopying Sass files ...');
      copySass();
    });
  });
});
