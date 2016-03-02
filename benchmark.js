const AWS    = require('aws-sdk');
const colors = require('colors');
const _      = require('lodash');
const Table = require('cli-table');

const credentials = require('./aws.json');
const config      = require('./config');

console.log('Testing startup performance'.green);
const lambda = new AWS.Lambda(credentials);

const benchmarkLambda = index => new Promise((resolve, reject) => {
  const startTime = Date.now();

  lambda.invoke({
    FunctionName: `benchmark-${index}`,
    LogType: 'None'
  }, (err, res) => {
    if (err) {
      return reject(err);
    }

    const delta = Date.now() - startTime;

    resolve(delta);
  });
});

Promise.all(_.range(config.count).map(benchmarkLambda))
.then(results => {
  table = new Table({
    head: ['#', 'Time'],
    colWidths: [20, 30]
  });

  var cumulative = 0;
  results.forEach((result, index) => {
    table.push([`#${index + 1}`, `${result}ms`]);
    cumulative += result;
  });
  table.push(['Average', `${Math.round(cumulative / results.length)}ms`]);

  console.log(table.toString());
})
.catch(err => {
  console.error(err);
});

