exports.set = function(name, value, callback) {
    Properties.findOne({ name : name }, function(err, existing_property) {
        console.log(existing_property);
        if (existing_property) {
            existing_property.value = value;
            existing_property.save(function(err) {});
            callback(existing_property);
        } else {
            Properties.create({ name: name, value: value }).done(function(err, created_property) {
                callback(created_property);
            });
        }
    });
}

exports.get = function(name, callback) {
    Properties.findOne({ name : name }, function(err, existing_property) {
        callback(existing_property);
    });
}