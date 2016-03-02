const AWS    = require('aws-sdk');
const colors = require('colors');
const _      = require('lodash');

const credentials = require('./aws.json');
const config      = require('./config');

console.log('Cleaning up..'.green);
const lambda = new AWS.Lambda(credentials);

const deleteLambda = index => new Promise((resolve, reject) => {
  lambda.deleteFunction({
    FunctionName: `benchmark-${index}`
  }, (err, res) => {
    if (err) {
      return reject(err);
    }

    resolve(res);
  });
});

Promise.all(_.range(config.count).map(deleteLambda))
.then(() => {
  console.log(`Done`.green);
})
.catch(err => {
  console.error(err);
});

