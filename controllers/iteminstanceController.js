var ItemInstance = require('../models/iteminstance');
var Item = require('../models/item')
var StoreLocation = require('../models/storelocation');
var async = require('async');
const { body,validationResult } = require('express-validator');

// Display list of all ItemInstances
exports.iteminstance_list = function(req, res, next) {
    
    ItemInstance.find()
    .populate('item')
    .populate('store_location')
    .exec(function (err, list_iteminstances) {
        if (err) { return next(err); }
        // successful so render
        res.render('iteminstance_list', { title: 'Item Instance List', iteminstance_list: list_iteminstances });
    });
};

// Display ItemInstance detail
exports.iteminstance_detail = function(req, res, next) {
    
    ItemInstance.findById(req.params.id)
    .populate('item store_location')
        .exec(function (err, iteminstance) {
            if (err) { return next(err); }
            if (iteminstance==null) { // no results
                var err = new Error('No item instance found');
                err.status = 404;
                return next(err);
            }
            // succesful so render
            res.render('iteminstance_detail', { title: 'Item: '+iteminstance.item.name, iteminstance: iteminstance });
        })
};

// Display ItemInstance create form on GET
exports.iteminstance_create_get = function(req, res, next) {

    async.parallel({

        items: function(callback) {
            Item.find(callback)
        },
        storelocations: function(callback) {
            StoreLocation.find(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
    
        res.render('iteminstance_form', { title: 'Create an item instance', items: results.items, storelocations: results.storelocations });
    });
}

// Handle ItemInstance create form on POST
exports.iteminstance_create_post = [

    // validate and sanitize fields
    body('item', 'Item must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('storelocation', 'Store Location must not be empty.').trim().isLength({ min: 1 }).escape(),

    // process req after validation sanitization
    (req, res, next) => {

        const errors = validationResult(req);

        // create iteminstance with escaped and trimmed data
        var iteminstance = new ItemInstance(
            { item: req.body.item,
            store_location: req.body.storelocation
        });

        if (!errors.isEmpty()) {
            // there are errors. render form again with sanitized values / error messages
            async.parallel({
                items: function(callback) {
                    Item.find(callback);
                },
                storelocations: function(callback) {
                    StoreLocation.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('iteminstance_form', { title: 'Create an Item Instance', items: results.items, storelocations: results.storelocations, iteminstance: iteminstance });
                
            });
            return;
        }
        else {
            // data from form is valid. Save iteminstance.
            iteminstance.save(function (err) {
                if (err) { return next(err); }
                // successful, redirect to new iteminstance record
                res.redirect(iteminstance.url);
            });
        }
    }  
];

// Display ItemInstance delete form on GET
exports.iteminstance_delete_get = function(req, res, next) {

    async.parallel({
        iteminstance: function(callback) {
            ItemInstance.findById(req.params.id).populate('item').exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.iteminstance == null) {
            res.redirect('/catalog/iteminstances');
        }
        else {
            res.render('iteminstance_delete', { title: 'Delete Item Instance', iteminstance: results.iteminstance })
        }
    })
};

// Handle ItemInstance delete form on POST
exports.iteminstance_delete_post = function(req, res, next) {
    
    async.parallel({
        iteminstance: function(callback) {
            ItemInstance.findById(req.body.instanceid).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.iteminstance == null) {
            // item instance not found. Redirect to list of all item instances
            res.redirect('/catalog/iteminstances');
        }
        else {
            // success, delete and redirect to list of instances
            ItemInstance.findByIdAndRemove(req.body.instanceid, function deleteInstance(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/iteminstances');
            })
        }
    })
};

// Display ItemInstance update form on GET
exports.iteminstance_update_get = function(req, res, next) {
    
    async.parallel({
        iteminstance: function(callback) {
            ItemInstance.findById(req.params.id).populate('item').populate('store_location').exec(callback)
        },
        items: function(callback) {
            Item.find(callback)
        },
        storelocations: function(callback) {
            StoreLocation.find(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.iteminstance == null) {
            res.redirect('/catalog/iteminstances');
        }
        else {
            res.render('iteminstance_form', { title: 'Update Item Instance', iteminstance: results.iteminstance, items: results.items, storelocations: results.storelocations })
        }
    })
};

// Handle ItemInstance update form on POST
exports.iteminstance_update_post = [

    //validate and sanitize fields
    body('item', 'Must select a valid item').trim().isLength({ min: 1 }).escape(),
    body('storelocation', 'Must select a store location').trim().isLength({ min: 1 }).escape(),

    // process req with sanitized values
    (req, res, next) => {

        const errors = validationResult(req);

        // create ItemInstance obj with escaped/trimmed data and old id
        var iteminstance = new ItemInstance({
            item: req.body.item,
            store_location:req.body.storelocation,
            _id:req.params.id 
        });

        if (!errors.isEmpty()) {
            
            // there are errors. render form with sanitized values and error messages

            async.parallel({
                items: function(callback) {
                    Item.find(callback)
                },
                storelocations: function(callback) {
                    StoreLocation.find(callback)
                }
            }, function(err, results) {
                if (err) { return next(err) }

                res.render('iteminstance_form', { title: 'Update Item Instance', iteminstance: iteminstance, items: results.items, storelocations: results.storelocations, errors: errors.array() });

            })
            return;
        }
        else {
            // data from form is valid. Update the record
            ItemInstance.findByIdAndUpdate(req.params.id, iteminstance, {}, function(err, theinstance) {
                if (err) { return next(err); }
                res.redirect(theinstance.url);
            })
        }
    }
]