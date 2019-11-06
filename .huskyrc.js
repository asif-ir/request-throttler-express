const tasks = arr => arr.join(' && ');

module.exports = {
  'hooks': {
    'pre-commit': tasks([
      './node_modules/eslint/bin/eslint.js *.js --fix',
      './node_modules/prettier/bin-prettier.js *.js --write',
      'npm run test',
    ])
  }
};
