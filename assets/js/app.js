$(function() {

  // Use {{ var }} instead of <%= var %> for underscore templates
  _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
  };


  /****** Backbone.js Stuff ******/

  var tableApp = {};

  tableApp.Row = Backbone.Model.extend({});

  tableApp.RowList = Backbone.Collection.extend({
    model: tableApp.Row,
    url: "/teams"
  });

  tableApp.RowView = Backbone.View.extend({
    template: _.template($("#row-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  tableApp.TableView = Backbone.View.extend({
    el: "#table",
    initialize: function() {
      tableApp.rowList.on("add", this.addOne, this);
      tableApp.rowList.on("reset", this.addAll, this);
      tableApp.rowList.fetch();
    },
    addOne: function(row) {
      var view = new tableApp.RowView({ model: row });
      $("#table").append(view.render().el);
    },
    addAll: function() {
      $("#table").html("");
      tableApp.rowList.each(this.addOne, this);
    }
  })

  tableApp.rowList = new tableApp.RowList();
  tableApp.tableView = new tableApp.TableView();

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
