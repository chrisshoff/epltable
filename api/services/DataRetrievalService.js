var jsdom = require("jsdom"),
    moment = require("moment");

var team_results_url = "http://www.premierleague.com/en-gb/matchday/results.html?paramClubId=";
var jquery_url = "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js";

var teams_to_page_ids = {
    arsenal : { id : 3, full_name: "arsenal" },
    aston_villa : { id : 7, full_name: "aston_villa" },
    cardiff : { id : 97, full_name: "cardiff_city" },
    chelsea : { id : 8, full_name: "chelsea" },
    crystal_palace : { id : 31, full_name: "crystal_palace" },
    everton : { id : 11, full_name: "everton" },
    fulham : { id : 54, full_name: "fulham" },
    hull : { id : 88, full_name: "hull_city" },
    liverpool : { id : 14, full_name: "liverpool" },
    man_city : { id : 43, full_name: "manchester_city" },
    man_utd : { id : 1, full_name: "manchester_united" },
    newcastle : { id : 4, full_name: "newcastle_united" },
    norwich : { id : 45, full_name: "norwich_city" },
    southampton : { id : 20, full_name: "southampton" },
    stoke : { id : 110, full_name: "stoke_city" },
    sunderland : { id : 56, full_name: "sunderland" },
    swansea : { id : 80, full_name: "swansea_city" },
    spurs : { id : 6, full_name: "tottenham_hotspur" },
    west_brom : { id : 35, full_name: "west_bromwich_albion" },
    west_ham : { id : 21, full_name: "west_ham_united" }
};

exports.init_table_data_update = function(interval) {
    update_table_data(function() {
        DataRetrievalService.scrape_team_results_data(function() {});
    });
    setInterval(function() {
        update_table_data(function() {});
    }, interval);
}

function update_table_data(callback) {
    DataRetrievalService.scrape_table_data(function(rows) {
        var most_played_games = 0;
        for (var i in rows) {
            var thisPosition = Teams.findOne({ position : rows[i].position }, function(err, existing_row) {
                if (existing_row) {
                    // Update team at position
                    existing_row.name = rows[i].name;
                    existing_row.points = rows[i].points;
                    existing_row.save(function(err) {});
                    if (existing_row.played > most_played_games) {
                      most_played_games = existing_row.played;
                    }
                } else {
                    // Create new team at position
                    Teams.create(rows[i]).done(function(err, created_row) {
                      if (created_row.played > most_played_games) {
                        most_played_games = created_row.played;
                      }
                    });
                }
            });
        }

        PropertiesService.set("last_updated", moment().format("YYYY-MM-DD hh:mmA"), function(property) {});
        PropertiesService.set("most_played_games", most_played_games, function(property) {});
        callback();
    });
}

exports.scrape_team_results_data = function(callback) {
    var results_returned = 0;

    for (var i in teams_to_page_ids) {
        var team = teams_to_page_ids[i];
        jsdom.env(team_results_url + team.id, [jquery_url],
            (function(teamname, full_name) {
                return function(err, window) {
                    results_returned++;
                    var $ = window.jQuery;
                    var matches_json = [];
                    $(".contentTable").each(function() {
                        var date = $.trim($(this).find("th:first").text());
                        var home = $.trim($(this).find(".rHome").text());
                        var away = $.trim($(this).find(".rAway").text());
                        var score = $.trim($(this).find(".score").text());
                        var score_array = score.split(" - ");
                        var home_score = parseInt(score_array[0]);
                        var away_score = parseInt(score_array[1]);
                        var points = 0;
                        if (home_score == away_score) {
                            points = 1;
                        } else if (home_score > away_score && home.toLowerCase().replace(/ /g, "_") == teamname) {
                            points = 3;
                        } else if (away_score > home_score && away.toLowerCase().replace(/ /g, "_") == teamname) {
                            points = 3;
                        }

                        matches_json.push({ date: date, home: home, away: away, home_score: home_score, away_score: away_score, points: points });
                    });

                    Teams.findOne({ slug: full_name }, function(err, existing_team) {
                        existing_team.matches = matches_json;
                        existing_team.save(function(err){});
                    });

                    if (results_returned == 20) {
                        callback();
                    }
                }
            })(i, team.full_name)
        );
    }
}

exports.scrape_table_data = function(callback) {
    var rows = [];

    jsdom.env(
        "http://www.premierleague.com/en-gb/matchday/league-table.html",
        [jquery_url],
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
                    gd: $(this).find(".col-gd").text(),
                    played: $(this).find(".col-p").text()
                };

                rows.push(row);
            });

            callback(rows);
        }
    );
}
