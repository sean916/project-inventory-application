var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemInstanceSchema = new Schema(
    {
        item: { type: Schema.Types.ObjectId, ref: 'Item' },
        store_location: {type: Schema.Types.ObjectId, ref: 'StoreLocation'}
    }
);

ItemInstanceSchema
.virtual('url')
.get(function () {
    return '/catalog/iteminstance/' + this._id
});

ItemInstanceSchema
.virtual('name')
.get(function () {
    return this.item.name;
})

// export model

module.exports = mongoose.model('ItemInstance', ItemInstanceSchema);