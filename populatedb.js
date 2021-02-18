#! /usr/bin/env node

console.log('This script populates some test items, store locations, categories, and iteminstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var StoreLocation = require('./models/storelocation')
var Category = require('./models/category')
var ItemInstance = require('./models/iteminstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []
var storelocations = []
var iteminstances = []

function storeLocationCreate(city_name, zip_code, cb) {
  storelocationdetail = { city_name: city_name, zip_code: zip_code }
  
  var storelocation = new StoreLocation(storelocationdetail);
       
  storelocation.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Store Location: ' + storelocation);
    storelocations.push(storelocation)
    cb(null, storelocation)
  }  );
}

function categoryCreate(name, description, cb) {
    categorydetail = { name: name, description: description }
  var category = new Category({ name: name, description: description });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function itemCreate(name, description, category, price, cb) {
  itemdetail = { 
    name: name,
    description: description,
    category: category,
    price: price
  }
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}


function itemInstanceCreate(item, store_location, cb) {
  iteminstancedetail = { 
    item: item,
    store_location: store_location
  }    
    
  var iteminstance = new ItemInstance(iteminstancedetail);    
  iteminstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING ItemInstance: ' + iteminstance);
      cb(err, null)
      return
    }
    console.log('New ItemInstance: ' + iteminstance);
    iteminstances.push(iteminstance)
    cb(null, item)
  }  );
}

// Make up my own store locations and categories.

function createCategoriesStoreLocations(cb) {
    async.series([
        function(callback) {
          storeLocationCreate('Davis', 95616, callback);
        },
        function(callback) {
            storeLocationCreate('Sacramento', 95864, callback);
        },
        function(callback) {
          categoryCreate("Produce", "Fresh Fruits, Vegetables, etc.", callback);
        },
        function(callback) {
          categoryCreate("Deli", "Fresh Meats etc.", callback);
        },
        function(callback) {
            categoryCreate("Dairy", "Butter, Milk, Butter, etc.", callback);
          },
        function(callback) {
            categoryCreate("Groceries", "Non-perishable Food Items", callback);
          },
          function(callback) {
            categoryCreate("Household Goods", "Non-food Items", callback);
          }
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Butter', 'Tasty, tasty Butter', categories[2], 3.99, callback);
        },
        function(callback) {
          itemCreate('Organic Cucumber', 'Perfect for Night Crawlers', categories[0], 1.99, callback);
        },
        function(callback) {
          itemCreate('Cereal', 'The cold kind or the hot kind', categories[3], 3.99, callback);
        },
        function(callback) {
          itemCreate('Carpet Cleaner', 'Perfect for messes', categories[4], 5.99, callback);
        },
        function(callback) {
          itemCreate('Bacon', 'Tasty, Tasty Bacon', categories[1], 6.99, callback);
        }
        ],
        // optional callback
        cb);
}


function createItemInstances(cb) {
    async.parallel([
        function(callback) {
          itemInstanceCreate(items[0], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[0], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[1], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[1], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[1], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[2], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[2], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[2], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[3], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[3], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[3], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[4], storelocations[0], callback)
        },
        function(callback) {
          itemInstanceCreate(items[4], storelocations[1], callback)
        },
        function(callback) {
          itemInstanceCreate(items[0], storelocations[0], callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createCategoriesStoreLocations,
    createItems,
    createItemInstances,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('ItemInstances: '+iteminstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



