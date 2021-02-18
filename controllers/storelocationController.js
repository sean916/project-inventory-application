var StoreLocation = require('../models/storelocation');
var ItemInstance = require('../models/iteminstance');
var Item = require('../models/item');
var async = require('async');
const { body,validationResult } = require('express-validator');

// Display list of all store locations
exports.storelocation_list = function(req, res, next) {
    
    StoreLocation.find()
    .sort([['city_name', 'ascending']])
    .exec( function(err, list_storelocations) {
        if (err) { return next(err) }
        // successful so render
        res.render('storelocation_list', { title: 'Store Location List', storelocation_list: list_storelocations });
    });
};

// Display detail of store location
exports.storelocation_detail = function(req, res, next) {
    
    async.parallel({
        storelocation: function(callback) {
            StoreLocation.findById(req.params.id)
                .exec(callback)
        },
        storelocation_items: function(callback) {
            ItemInstance.find({ 'store_location': req.params.id }, 'item')
                .populate('item')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } 
        if (results.storelocation==null) { // no results
            var err = new Error('Store location not found')
            err.status = 404;
            return next(err);
        }
        // successful so render
        res.render('storelocation_detail', { title: 'Store Location Detail', storelocation: results.storelocation, storelocation_items: results.storelocation_items } );
    });
};

// Display store location create on GET
exports.storelocation_create_get = function(req, res, next) {
    res.render('storelocation_form', { title: 'Create a Store Location' });
};

// Handle store location create on POST
exports.storelocation_create_post = [

    // sanitize and validate responses
    body('city_name').trim().isLength({ min: 1 }).escape().withMessage('Must enter a valid city name'),
    body('zip_code').trim().isLength({ min: 5 }).escape().withMessage('Must enter a valid zip code'),

    // process request after validation and sanitization
    (req, res, next) => {
        // extract validation errors from a request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // there are errors. render form again with sanitized values / error messages
            res.render('storelocation_form', { title: 'Create a Store Location', storelocation: req.body, errors: errors.array() });
            return;
        }
        else {
            // data from form is valid
            // create StoreLoaction object with escaped and trimmed data.
            var storelocation = new StoreLocation(
                {
                    city_name: req.body.city_name,
                    zip_code: req.body.zip_code
                }
            );
            storelocation.save(function (err) {
                if (err) { return next(err); }
                // successful, redirect to new store location record
                res.redirect(storelocation.url);
            });
        }
    }

];

// Display store location delete on GET
exports.storelocation_delete_get = function(req, res, next) {
    
    async.parallel({
        storelocation: function(callback) {
            StoreLocation.findById(req.params.id).exec(callback)
        },
        storelocation_iteminstances: function(callback) {
            ItemInstance.find({ 'store_location': req.params.id }).populate('item').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.storelocation==null) { //no results
            res.redirect('/catalog/storelocations');
        }
        // successful so render
        res.render('storelocation_delete', { title: 'Delete Store Location', storelocation: results.storelocation, storelocation_iteminstances: results.storelocation_iteminstances });
    });
};

// Handle store location delete on POST
exports.storelocation_delete_post = function(req, res, next) {

    async.parallel({
        storelocation: function(callback) {
            StoreLocation.findById(req.body.storelocationid).exec(callback)
        },
        storelocation_iteminstances: function(callback) {
            ItemInstance.find({ 'store_location': req.body.storelocationid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // success
        if (results.storelocation_iteminstances.length > 0) {
            // Store location has item instances. Render in same way as GET route
            res.render('storelocation_delete', { title: 'Delete Store Location', storelocation: results.storelocation, storelocation_iteminstances: results.storelocation_iteminstances });
            return;
        }
        else {
            // store location has no item instances. Delete object and redirect to list of store locations
            StoreLocation.findByIdAndRemove(req.body.storelocationid, function deleteStoreLocation(err) {
                if (err) { return next(err); }
                // success - go to store location list
                res.redirect('/catalog/storelocations');
            })
        }
    });
};

// Display store location update on GET
exports.storelocation_update_get = function(req, res, next) {
    
    async.parallel({
        storelocation: function(callback) {
            StoreLocation.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('storelocation_form', {title: 'Update Store Location', storelocation: results.storelocation });
    })
};

// Handle store location update on POST
exports.storelocation_update_post = [

    // validate and sanitize
    body('city_name', 'Must enter a valid city name').trim().isLength({ min: 1 }).escape(),
    body('zip_code', 'Must enter a valid zip code').trim().isLength({ min: 5 }).escape(),

    //process request 
    (req, res, next) => {

        const errors = validationResult(req);

        // create store location with validated and sanitized fields
        var storelocation = new StoreLocation({
            city_name: req.body.city_name,
            zip_code: req.body.zip_code,
            _id: req.params.id
        });
        if (!errors.isEmpty()) {
            // there are errors. render form with sanitized values and error messages
            res.render('storelocation_form', { title: 'Update Store Location', storelocation: storelocation, errors: errors.array() });
        }
        else {
            // data from form is valid. update record
            StoreLocation.findByIdAndUpdate(req.params.id, storelocation, {}, function (err, thestorelocation) {
                if (err) { return next(err); }
                res.redirect(thestorelocation.url);
            });
        }
    }
];