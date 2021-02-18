var mongoose = require ('mongoose');

var Schema = mongoose.Schema;

var StoreLocationSchema = new Schema(
    {
        city_name: {type: String},
        zip_code: {type: Number}
    }
);

StoreLocationSchema
.virtual('url')
.get(function () {
    return '/catalog/storelocation/' + this._id;
});

StoreLocationSchema
.virtual('detail')
.get(function () {
  return this.city_name + ', ' + this.zip_code;
});

// export model
module.exports = mongoose.model('StoreLocation', StoreLocationSchema);