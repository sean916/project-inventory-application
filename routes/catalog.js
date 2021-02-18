var express = require('express');
var router = express.Router();

// Require controller modules
var category_controller = require('../controllers/categoryController');
var item_controller = require('../controllers/itemController');
var item_instance_controller = require('../controllers/iteminstanceController');
var store_location_controller = require('../controllers/storelocationController');

/// ITEM ROUTES ///

// GET catalog home page
router.get('/', item_controller.index);

// GET request for creating item (must come before routes that display Item using id)
router.get('/item/create', item_controller.item_create_get);

// POST request for creating Item
router.post('/item/create', item_controller.item_create_post);

// GET request to delete Item
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete Item
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update Item
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Item
router.post('/item/:id/update', item_controller.item_update_post);

// GET request for one Item
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all Items
router.get('/items', item_controller.item_list);

/// CATEGORY ROUTES ///

// GET request for creating Category. Must come before route using id
router.get('/category/create', category_controller.category_create_get);

// POST request for creating Category
router.post('/category/create', category_controller.category_create_post);

// GET request to delete Category
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Category
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Category
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Category
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one Category
router.get('/category/:id', category_controller.category_detail);

// GET request for all Categories
router.get('/categories', category_controller.category_list);

/// STORE LOCATION ROUTES

// GET request for creating Store Location. Must come before route using id
router.get('/storelocation/create', store_location_controller.storelocation_create_get);

// POST request for creating Store Location
router.post('/storelocation/create', store_location_controller.storelocation_create_post);

// GET request to delete Store Location
router.get('/storelocation/:id/delete', store_location_controller.storelocation_delete_get);

// POST request to delete Store Location
router.post('/storelocation/:id/delete', store_location_controller.storelocation_delete_post);

// GET request to update Store Location
router.get('/storelocation/:id/update', store_location_controller.storelocation_update_get);

// POST request to update Store Location
router.post('/storelocation/:id/update', store_location_controller.storelocation_update_post);

// GET request to view one Store Location
router.get('/storelocation/:id', store_location_controller.storelocation_detail);

// GET request to view list of all Store Locations
router.get('/storelocations', store_location_controller.storelocation_list);

/// ITEMINSTANCE ROUTES ///

// GET request for creating ItemInstance. Must come before route using id
router.get('/iteminstance/create', item_instance_controller.iteminstance_create_get);

// POST request for creating ItemInstance
router.post('/iteminstance/create', item_instance_controller.iteminstance_create_post);

// GET request to delete ItemInstance
router.get('/iteminstance/:id/delete', item_instance_controller.iteminstance_delete_get);

// POST request to delete ItemInstance
router.post('/iteminstance/:id/delete', item_instance_controller.iteminstance_delete_post);

// GET request to update ItemInstance
router.get('/iteminstance/:id/update', item_instance_controller.iteminstance_update_get);

// POST request to update ItemInstance
router.post('/iteminstance/:id/update', item_instance_controller.iteminstance_update_post);

// GET request to view one ItemInstance
router.get('/iteminstance/:id', item_instance_controller.iteminstance_detail);

// GET request to view list of all ItemInstances
router.get('/iteminstances', item_instance_controller.iteminstance_list);

module.exports = router;