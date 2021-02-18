var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
        name: {type: String, maxlength: 100},
        description: {type: String}
    }
);

CategorySchema
.virtual('url')
.get(function () {
    return '/catalog/category/' + this._id;
});

// export model
module.exports = mongoose.model('Category', CategorySchema);