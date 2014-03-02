var jsdom = require("jsdom"),
    moment = require("moment");

exports.init_data_update = function(interval) {
    setInterval(function() {
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
    }, interval);
}

exports.scrape = function(callback) {
    var rows = [];
    
    jsdom.env(
        "http://www.premierleague.com/en-gb/matchday/league-table.html",
        ["//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"], 
        function(err, window) {
            var $ = window.jQuery;
            $(".table .club-row").each(function() {
                var name = $(this).find(".col-club").text();
                var slug = name.toLowerCase().replace(/ /g, "_");
                var row = {
                    position: $(this).find(".col-pos").text(),
                    name: name,
                    slug: slug,
                    points: $(this).find(".col-pts").text(),
                    gd: $(this).find(".col-gd").text()
                };

                rows.push(row);
            });

            callback(rows);
        }
    );
}