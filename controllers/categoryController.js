var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require("express-validator");

// Display list of all categories
exports.category_list = function(req, res, next) {
    
    Category.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_categories) {
            if (err) { return next(err); }
            // successful so render
            res.render('category_list', { title: 'Category List', category_list: list_categories });
        });
};

// Display detail page for a specific Category
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
                .exec(callback);
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // no results
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // successful so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });
};

// Display Category create form on GET
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST
exports.category_create_post = [

    // validate and sanitise name field
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    
    //validate and sanitize description field
    body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),

    // process request after validation and sanitization
    (req, res, next) => {

        // extract errors from request
        const errors = validationResult(req);

        // create category obj with escaped and trimmed data
        var category = new Category(
            {
                name: req.body.name,
                description: req.body.description 
            }
        );

        if (!errors.isEmpty()) {
            // there are errors. Render form with sanitized values / error messages
            res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
            return;

        } else { // Data from form is valid. Check if Category with same name already exists
            Category.findOne({ 'name': req.body.name })
            .exec( function(err, found_category) {
                if (err) { return next(err); }

                if (found_category) { // Category exists, redirect to its detail page
                    res.redirect(found_category.url);

                } else { // data valid and category does not already exist
                    category.save(function (err) {
                        if (err) { return next(err); }
                        // Category saved. redirect to category detail page
                        res.redirect(category.url);
                    });
                }
            });

        }
    }
]

// Display Category delete form on GET
exports.category_delete_get = function(req, res, next) {

    async.parallel({

        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err); }
        if (results.category==null) { // no results
            res.redirect('/catalog/categories');
        }
        // successful so render.
        res.render('category_delete', { title: 'Delete Category',  category: results.category, category_items: results.category_items });
    })
};

// Handle Category delete on POST
exports.category_delete_post = function(req, res, next) {

    async.parallel({

        category: function(callback) {
            Category.findById(req.body.categoryid).exec(callback)
        },
        category_items: function(callback) {
            Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // success
        if (results.category_items.length > 0) {
            // Category has items. Render in same way as GET route
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items });
            return;
        }
        else { // Category has no items. Delete object and redirect to list of categories.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // success - go to category list
                res.redirect('/catalog/categories')
            })
        }
    });
    
};

// Display Category update form on GET
exports.category_update_get = function(req, res, next) {
    
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category == null) {
            res.redirect('/catalog/categories');
        }
        else {
            res.render('category_form', { title: 'Update Category', category: results.category });
        }
    })
};

// Handle Category update on POST
exports.category_update_post = [

    // validate and sanitize fields
    body('name', 'Must enter a valid name').trim().isLength({ min: 1 }).escape(),
    body('description', 'Must enter a valid description').trim().isLength({ min: 1 }).escape(),

    // process request with sanitized values
    (req, res, next) => {

        const errors = validationResult(req);

        // create Category obj with escaped / trimmed data and old id
        var category = new Category(
            { name: req.body.name,
              description: req.body.description,
              _id: req.params.id 
            }
        );

        if (!errors.isEmpty()) {
            // there are errors. Render GET form with sanitized values and error messages
            res.render('category_form', { title: 'Update Category', category: category, errors: errors.array() })
        }
        else {
            // data is valid. update record and redirect to detail page
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
                if (err) { return next(err); }
                res.redirect(thecategory.url);
            });
        }
    }
]