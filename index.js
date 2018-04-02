const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
const express = require('express');
const request = Promise.promisify(require('request'));

mongoose.connect('mongodb://localhost:27017/dash-for-the-bus');

var Schema = mongoose.Schema;

// create a schema
var secretSchema = new Schema({
  name: String,
  value: String,
});

var Secret = Promise.promisifyAll(mongoose.model('Secret', secretSchema));
//
// var testSecret = new Secret({
//   name: 'Testing123',
//   value: 'butts butts butts',
// });
//
// testSecret
//   .saveAsync()
//   .then(() => {
//     console.log('Done!');
//   })
//   .catch(err => {
//     console.log('Oh noes!');
//   });

/**
apiName: One of 'schedule', 'realtime'
modality: One of 'buses', 'sydneytrains', 'ferries', 'lightrail', 'nswtrains'
*/
function getTransitDataUri(modality, apiName) {
  const base = 'https://api.transport.nsw.gov.au/v1/gtfs';
  return [base, apiName, modality].join('/');
}

Secret.findOneAsync({ name: 'TFNSW-API-KEY' })
  .then(results => {
    const keyHeader = 'apikey ' + results.value;
    return request({
      uri: getTransitDataUri('buses', 'schedule'),
      method: 'GET',
      headers: {
        Authorization: keyHeader,
      },
    });
  })
  .then(result => console.dir(result.body.length))
  .finally(() => {
    process.exit(0);
  });
