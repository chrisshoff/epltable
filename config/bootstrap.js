var moment = require("moment");

/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  update_data();
  setInterval(update_data, 600000);
  cb();
};

function update_data() {
    ScrapingService.scrape(function(rows) {
        for (var i in rows) {
            var thisPosition = Teams.findOne({ position : rows[i].position }, function(err, existing_row) {
                if (existing_row) {
                    // Update team at position
                    existing_row.name = rows[i].name;
                    existing_row.points = rows[i].points;
                    existing_row.save(function(err) {});
                } else {
                    // Create new team at position
                    Teams.create(rows[i]).done(function(err, created_row) {});
                }
            });
        }

        PropertiesService.set("last_updated", moment().format("YYYY-MM-DD hh:mmA"), function(property) {});
    });
}