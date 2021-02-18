var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: {type: String, maxlength: 100},
        description: {type: String},
        category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
        price: {type: Number}
    }
);

// Virtual for item's URL
ItemSchema
.virtual('url')
.get(function () {
    return '/catalog/item/' + this._id;
});

// export model

module.exports = mongoose.model('Item', ItemSchema);