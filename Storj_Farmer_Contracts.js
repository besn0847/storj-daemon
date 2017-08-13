// How to run it
// Requires nodejs LTS, git, python2
// Open command line and move to the folder where this script is stored
// Edit the script and modify storage location (line 87)
// Check the startDate and EndDate and modify it if you need another timeframe (line 102 - 103)
// Stop the farmer
// Execute "npm install storj-lib"
// Execute "node Storj_Farmer_Contracts.js"
// Start the farmer

// Example output and how to read it
//{
//        "Report generate at": "2017-02-06T22:50:25.063Z",
//        "StartDate": "2017-02-01T00:00:00.000Z",
//        "EndDate": "2017-03-01T00:00:00.000Z",
//        "188071ba7cfd974a9e47b59e24b0737ebf845db3": {
//                "1L...": {
//                        "xpub6AHweYHAxk1EhJSBctQD1nLWPog6Sy2eTpKQLExR1hfzTyyZQWvU4EYNXv1NJN7GpLYXnDLt4PzN874g6zSjAQdFCHZN7U7nbYKYVDUzD42": {
//                                "0": {
//                                        "Contracts": 130,
//                                        "TotalGB": 0.8668474899999995
//                                },
//                                "1": {
//                                        "Contracts": 401,
//                                        "TotalGB": 3.0031296040000113
//                                },
//                                "2": {
//                                        "Contracts": 867,
//                                        "TotalGB": 6.033447554000032
//                                },
//                                "3": {
//                                        "Contracts": 62,
//                                        "TotalGB": 0.5759186580000002
//                                },
//                                "4": {
//                                        "Contracts": 1,
//                                        "TotalGB": 0.007168
//                                },
//                                "5": {
//                                        "Contracts": 363,
//                                        "TotalGB": 2.615865879000011
//                                },
//                                "6": {
//                                        "Contracts": 19,
//                                        "TotalGB": 0.12380243499999995
//                                },
//                                "MinBegin": "2017-01-14T15:17:15.962Z",
//                                "MaxBegin": "2017-02-07T00:14:47.564Z",
//                                "MinEnd": "2017-02-07T20:30:39.554Z",
//                                "MaxEnd": "2017-05-08T00:14:47.564Z",
//                                "Contracts": 6609,
//                                "TotalGB": 24.91734677900061,
//                                "GigabyteHours": 15823.516395540535,
//                                "GibibyteHours": 14736.798028965208
//                        }
//                }
//       }
//}
// Report generated at 06.02.2017 and calculate GBh for 01.02.2017 - 01.03.2017
//
// Only one farmerID 188071ba7cfd974a9e47b59e24b0737ebf845db3 thats fine. If you see more than one you have a problem.
// Most likely you lost the old private key. 
// The renter will not be able to download these shards and not pay for these lost shards.
//
// One Payout Address 1L...
// Switching the payout address is allowed so don't worry if you see more than one.
//
// Only one BridgeID xpub6AHweYHAxk1EhJSBctQD1nLWPog6Sy2eTpKQLExR1hfzTyyZQWvU4EYNXv1NJN7GpLYXnDLt4PzN874g6zSjAQdFCHZN7U7nbYKYVDUzD42
// That is the Storj Main Bridge and all of its shards are paid.
// If you see other BridgeIDs better check if they are paid or not.
//
// At day 0 I signed 130 new contracts and received 866 MB
// At day 1 I signed 401 new contracts etc
//
// The contracts begin beween 2017-01-14T15:17:15.962Z and 2017-02-04T06:10:27.476Z
// The contracts will expire between 2017-02-06T22:50:25.063Z and 2017-05-05T06:10:27.476Z
//
// I have a total size of ~22GB and at the end of this month I will have 14358 GBh.
// If I sign more contracts I will end up with more GBh.
// If I break the contract rules I will lose them all and end up with 0 GBh.

var storj = require('storj-lib');
var stream = require('readable-stream');

// insert your storage location here.
// on Windows you need double backslash. C:\\storjshare\\whatever
var persistence = new storj.EmbeddedStorageAdapter('insert your storage location here');
var manager = new storj.StorageManager(persistence);

var StorageAdapter = require('storj-lib/lib/storage/adapter');
var StorageItem = require('storj-lib/lib/storage/item');

var rstream = manager._storage.createReadStream();

var currentTime = Date.now();

var startDate = 0;
var endDate = currentTime;

// estimated GBh calculation for 01.02.2017 - 01.03.2017
// remove these 2 lines if you like to get a complete list.
startDate = Number(new Date('2017-06-01T00:00:00.000Z'));
endDate = Number(new Date('2017-07-01T00:00:00.000Z'));

var report = {'Report generate at': new Date(), 'StartDate': new Date(startDate), 'EndDate': new Date(endDate)};

rstream.on('data', function(item) {
  rstream.pause();
  Object.keys(item.contracts).some(function(nodeID) {
    var contract = item.contracts[nodeID];
    if (contract.get('store_begin') < endDate && contract.get('store_end') > startDate) {
      manager.load(item.hash, function(err, shard) {
        if (!err && typeof shard.shard.write !== 'function' && !(shard.shard instanceof stream.Writable)) {
          var renter = contract.get('renter_hd_key');
          var farmer = contract.get('farmer_id');
          var payout = contract.get('payment_destination');
          if (renter === false) {
            renter = contract.get('renter_id');
          }
          if (!report[farmer]) {
            report[farmer] = {};
          }
          if (!report[farmer][payout]) {
            report[farmer][payout] = {};
          }
          if (!report[farmer][payout][renter]) {
            report[farmer][payout][renter] = {};
            report[farmer][payout][renter]['MinBegin'] = contract.get('store_begin');
            report[farmer][payout][renter]['MaxBegin'] = 0;
            report[farmer][payout][renter]['MinEnd'] = contract.get('store_end');
            report[farmer][payout][renter]['MaxEnd'] = 0;
            report[farmer][payout][renter]['Contracts'] = 0;
            report[farmer][payout][renter]['TotalGB'] = 0;
            report[farmer][payout][renter]['GigabyteHours'] = 0;
            report[farmer][payout][renter]['GibibyteHours'] = 0;
          }

          report[farmer][payout][renter]['Contracts']++;
          report[farmer][payout][renter]['TotalGB'] += contract.get('data_size') / (1000 * 1000 * 1000);

          var contractIsActive = endDate < contract.get('store_end');
          var wasActiveAtStart = startDate > contract.get('store_begin');
          var time = 0;

          if ( contractIsActive ) {
            time = wasActiveAtStart ?
              endDate - startDate :
              endDate - contract.get('store_begin');
          } else if ( !contractIsActive ) {
            time = wasActiveAtStart ?
              contract.get('store_end') - startDate :
              contract.get('store_end') - contract.get('store_begin');
          }

          var hours = time / (1000 * 60 * 60);
          var gigabytes = contract.get('data_size') / (1000 * 1000 * 1000);
          var gibibytes = contract.get('data_size') / (1024 * 1024 * 1024);

          report[farmer][payout][renter]['GigabyteHours'] += gigabytes * hours;
          report[farmer][payout][renter]['GibibyteHours'] += gibibytes * hours;

          if (report[farmer][payout][renter]['MinEnd'] > contract.get('store_end')) {
            report[farmer][payout][renter]['MinEnd'] = contract.get('store_end');
          }
          if (report[farmer][payout][renter]['MaxEnd'] < contract.get('store_end')) {
            report[farmer][payout][renter]['MaxEnd'] = contract.get('store_end');
          }

          if (report[farmer][payout][renter]['MinBegin'] > contract.get('store_begin')) {
            report[farmer][payout][renter]['MinBegin'] = contract.get('store_begin');
          }
          if (report[farmer][payout][renter]['MaxBegin'] < contract.get('store_begin')) {
            report[farmer][payout][renter]['MaxBegin'] = contract.get('store_begin');
          }

          if (contract.get('store_begin') > startDate) {
            day = parseInt((contract.get('store_begin') - startDate) / (1000 * 60 * 60 * 24));
            if (!report[farmer][payout][renter][day]) {
              report[farmer][payout][renter][day] = {};
              report[farmer][payout][renter][day]['Contracts'] = 0;
              report[farmer][payout][renter][day]['TotalGB'] = 0;
            }
            report[farmer][payout][renter][day]['Contracts']++;
            report[farmer][payout][renter][day]['TotalGB'] += contract.get('data_size') / (1000 * 1000 * 1000);
          }
          rstream.resume();
          return true;
        } else {
          rstream.resume();
        }
      });
    } else {
      rstream.resume();
    }
  });
});

rstream.on('end', function() {
  Object.keys(report).forEach(function(farmer) {
    Object.keys(report[farmer]).forEach(function(payout) {
      Object.keys(report[farmer][payout]).forEach(function(renter) {
        report[farmer][payout][renter]['MinEnd'] = new Date(report[farmer][payout][renter]['MinEnd']);
        report[farmer][payout][renter]['MaxEnd'] = new Date(report[farmer][payout][renter]['MaxEnd']);
        report[farmer][payout][renter]['MinBegin'] = new Date(report[farmer][payout][renter]['MinBegin']);
        report[farmer][payout][renter]['MaxBegin'] = new Date(report[farmer][payout][renter]['MaxBegin']);
      });
    });
  });
  console.log(JSON.stringify(report, null, '\t'));
  process.exit();
});