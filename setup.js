const AWS    = require('aws-sdk');
const path   = require('path');
const AdmZip = require('adm-zip');
const colors = require('colors');
const _      = require('lodash');

const credentials = require('./aws.json');
const config      = require('./config');

console.log('Creating lambdas..'.green);

const zip = new AdmZip();
zip.addLocalFile(path.join(__dirname, 'lambda', 'function.js'));
const zipBuffer = zip.toBuffer();

const lambda = new AWS.Lambda(credentials);

const createLambda = index => new Promise((resolve, reject) => {
  lambda.createFunction({
    FunctionName: `benchmark-${index}`,
    Description: 'Test lambda cold start performance',
    Handler: 'handler',
    Role: credentials.role,
    Timeout: config.timeout,
    MemorySize: config.memory,
    Code: { ZipFile: zipBuffer },
    Runtime: 'nodejs4.3'
  }, (err, res) => {
    if (err) {
      return reject(err);
    }

    resolve(res);
  });
});

Promise.all(_.range(config.count).map(createLambda))
.then(() => {
  console.log(`${config.count} lambdas created`.green);
})
.catch(err => {
  console.error(err);
});

