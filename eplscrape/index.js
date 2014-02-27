var jsdom   = require("jsdom")

exports.scrape = function(callback) {
    var rows = [];
    
    jsdom.env(
        "http://www.premierleague.com/en-gb/matchday/league-table.html",
        ["//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"], 
        function(err, window) {
            var $ = window.jQuery;
            $(".table .club-row").each(function() {
                var row = {
                    pos: $(this).find(".col-pos").text(),
                    club: $(this).find(".col-club").text(),
                    points: $(this).find(".col-pts").text()
                };

                rows.push(row);
            });

            callback(rows);
        }
    );
}