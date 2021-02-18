var Item = require('../models/item');
var Category = require('../models/category');
var ItemInstance = require('../models/iteminstance');
var StoreLocation = require('../models/storelocation');
const { body, validationResult } = require("express-validator");

var async = require('async');

exports.index = function(req, res) {
    
    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback);
        },
        item_instance_count: function(callback) {
            ItemInstance.countDocuments({}, callback);
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback);
        },
        store_location_count: function(callback) {
            StoreLocation.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', {title: 'Inventory Application Home', error: err, data: results});
    });
};

// Display list of all Items
exports.item_list = function(req, res, next) {
    
    Item.find({}, 'name description category price')
        .populate('category')
        .exec(function (err, list_items) {
            if (err) { return next(err); }
            // successful so render
            res.render('item_list', { title: 'Item List', item_list: list_items });
        });
};

// Display detail page for a specific Item
exports.item_detail = function(req, res, next) {
    
    async.parallel({
        item: function(callback) {

            Item.findById(req.params.id)
                .populate('category')
                .exec(callback);
        },
        item_instance: function(callback) {

            ItemInstance.find({ 'item': req.params.id })
            .populate('store_location')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // no results
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // successful so render
        res.render('item_detail', { title: results.item.name, item: results.item, item_instances: results.item_instance });
    });
};

// Display Item create form on GET
exports.item_create_get = function(req, res, next) {
    
    // get all categories and store locations which we can add to our item
    async.parallel({
        categories: function(callback) {
            Category.find(callback)
        },
        storelocations: function(callback) {
        StoreLocation.find(callback);
        }, 
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Item', categories: results.categories, storelocations: results.storelocations });
    });
};

// Handle Item create on POST
exports.item_create_post = [
    // convert category to an array
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category ==='undefined')
            req.body.category = [];
            else
            req.body.category = new Array(req.body.category);
        }
        next();
    },

    // validate and sanitize the data
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),

    // process after validation and sanitization
    (req, res, next) => {
        // extract validation errors
        const errors = validationResult(req);

        // create Item obj with escaped and trimmed data
        var item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price
            }
        );
        if (!errors.isEmpty()) {
            // there are errors. render form with sanitized values
            // first get all categories and storelocations
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
                storelocations: function(callback) {
                    StoreLocation.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // mark selected categories as checked
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_form', { title: 'Create Item', item: item, categories: results.categories, storelocations: results.storelocations, errors: errors.array() });
            });
            return;
        }
        else { //data form is valid. save item
            item.save(function (err) {
                if (err) { return next(err); }
                // successful - redirect to new item page
                res.redirect(item.url);
            });
        }
    }
];

// Display Item delete on GET
exports.item_delete_get = function(req, res, next) {
    
    async.parallel({
        
        item: function(callback) {
            Item.findById(req.params.id).exec(callback)
        },
        item_instances: function(callback) {
            ItemInstance.find({ 'item': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item == null) { // item not found, redirect to list of items
            res.redirect('/catalog/items');
        }
        else {
            res.render('item_delete', { title: 'Delete Item', item: results.item, item_instances: results.item_instances });
        }
    });
};

// Handle Item delete on POST
exports.item_delete_post = function(req, res, next) {
    
    async.parallel({
        item: function(callback) {
            Item.findById(req.body.itemid).exec(callback);
            console.log('item-delete-post-1');
        },
        item_instances: function(callback) {
            ItemInstance.find({ 'item': req.body.itemid }).exec(callback)
            console.log('item-create-post-2');
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item_instances.length > 0) {
            console.log('item-create-post-3')
            // there are iteminstances, render GET route
            res.render('item_delete', { title: 'Delete Item', item: results.item, item_instances: results.item_instances });
        }
        // success, delete object and redirect page to list of items
        else {
            console.log('item-create-post-4')
            Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
                if (err) { return next(err); }
                // success. go to item list
                res.redirect('/catalog/items')
            })
        }
    });
};

// Display Item update on GET
exports.item_update_get = function(req, res, next) {
    
    async.parallel({

        item: function(callback) {
            Item.findById(req.params.id).populate('category').exec(callback)
        },
        categories: function(callback) {
            Category.find(callback)
        },
    }, function(err, results) {
        if (err) { return next(err) }
        if (results.item == null) {
            res.redirect('/catalog/items');
        }
        else {
            for (let all_c_iter = 0; all_c_iter < results.categories.length; all_c_iter++) {
                for (let item_c_iter = 0; item_c_iter < results.item.category.length; item_c_iter++) {
                    if (results.categories[all_c_iter]._id.toString()===results.item.category[item_c_iter]._id.toString()) {
                        results.categories[all_c_iter].checked='true';
                    }
                }
            }
            res.render('item_form', { title: 'Update Item', categories: results.categories, item: results.item });
        }
        }
    )

};

// Handle Item update on POST
exports.item_update_post = [

    // convert category to an array
    (req, res, next) => {
        if(!(req.body.category instanceof Array)) {
            if(typeof req.body.category === 'undefined')
            req.body.category = [];
        }
        next();
    },

    // validate and sanitize fields
    body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),

    // process request after validation and sanitization
    (req, res, next) => {

        // extract validation errors from a request
        const errors = validationResult(req);

        // create Item obj with escaped/trimmed data and old id.
        var item = new Item(
            { name: req.body.name,
            description: req.body.description,
            category: (typeof req.body.category==='undefined') ? [] : req.body.category,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // there are errors. Render GET form with sanitized values / error messages
            async.parallel({
                categories: function(callback) {
                    Category.find(callback)
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // mark selected categories as checked
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true'
                    }
                }
                res.render('item_form', { title: 'Update Item', item: item, categories: results.categories, errors: errors.Array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the Item record
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
                if (err) { return next(err); }
                // success - redirect to item detail page
                res.redirect(theitem.url);
            });
        }
    }

];