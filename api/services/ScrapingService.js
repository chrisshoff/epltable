var jsdom = require("jsdom")

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
                    points: $(this).find(".col-pts").text(),
                    slug: slug
                };

                rows.push(row);
            });

            callback(rows);
        }
    );
}