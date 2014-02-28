$(function() {

  // Use {{ var }} instead of <%= var %> for underscore templates
  _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
  };

  /****** Backbone.js Stuff ******/

  var tableApp = {};

  tableApp.GREEN_SPOTS = 4;
  tableApp.RED_SPOTS = 3;

  tableApp.Row = Backbone.Model.extend({});

  tableApp.RowList = Backbone.Collection.extend({
    model: tableApp.Row,
    url: "/teams"
  });

  tableApp.RowView = Backbone.View.extend({
    isEmpty: false,
    template: _.template($("#row-template").html()),
    className: "row team-row",
    applyColor: function(position) {
      if (position <= tableApp.GREEN_SPOTS) { 
        if (this.isEmpty && position == tableApp.GREEN_SPOTS) { return; }
        this.$el.addClass("green");
      }
      if (position > (tableApp.rowList.length - tableApp.RED_SPOTS)) { 
        if (this.isEmpty && position == (tableApp.rowList.length - tableApp.GREEN_SPOTS)) { return; }
        this.$el.addClass("red");
      }
    },
    render: function() {
      this.applyColor(this.model.get("position"));
      this.$el.attr("data-points", this.model.get("points"));
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  tableApp.EmptyRowView = tableApp.RowView.extend({
    isEmpty: true,
    className: "row team-row empty",
    render: function() {
      this.applyColor($("#table .team-row:not(.empty):last .position").text());
      this.$el.html(this.template({ position:"", points:"", name:"" }));
      return this;
    }
  });

  tableApp.TableView = Backbone.View.extend({
    el: "#table",
    initialize: function() {
      tableApp.rowList.fetch().done(this.render);
    },
    render: function() {
      $("#table").html("");
      tableApp.rowList.each(function(row) {
        var view = new tableApp.RowView({ model: row });
        $("#table").append(view.render().el);
      }, this);
    }
  });

  tableApp.CannTableView = tableApp.TableView.extend({
    render: function(row) {
      $("#table").html("");
      tableApp.rowList.each(function(row) {
        var view = new tableApp.RowView({ model: row });
        var extra_rows;

        if (row.get("position") > 1) {
          var last_points = $("#table .team-row:last").data("points");
          var this_points = row.get("points");
          extra_rows = last_points - this_points - 1;

          if (extra_rows > 0) {
            for (var i = 0; i < extra_rows; i++) {
              $("#table").append((new tableApp.EmptyRowView()).render().el);
            }
          }
        }

        if (extra_rows == -1 && row.get("position") > 1) {
          $("#table .team-row:not(.empty):last").find(".name").append("<br />" + row.get("name"));
        } else {
          $("#table").append(view.render().el);
        }
      }, this);
    }
  });

  tableApp.Router = Backbone.Router.extend({
    routes : {
      "" : "default",
      "default" : "default",
      "cann" : "cann"
    },

    default : function() {
      tableApp.view = new tableApp.TableView();
    },

    cann : function() {
      tableApp.view = new tableApp.CannTableView();
    }
  });

  $("#table-selector").on("change", function(e) {
    tableApp.router.navigate($(this).val(), { trigger: true });
  });

  tableApp.rowList = new tableApp.RowList();
  tableApp.router = new tableApp.Router();

  Backbone.history.start();
  $("#table-selector").val(Backbone.history.fragment);

  /****** End Backbone.js Stuff ******/

});

(function (io) {

  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to 
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' + 
        'e.g. to send a GET request to Sails, try \n' + 
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }
  

})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);
