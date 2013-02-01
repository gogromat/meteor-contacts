// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Contacts = new Meteor.Collection("contacts");


if (Meteor.isClient) {


  Template.contacts_view.contacts = function () {
    return Contacts.find({}, {sort: {name: 1, address: 1}});
  };

  //Template.leaderboard.selected_name = function () {
  //  var player = Players.findOne(Session.get("selected_player"));
  //  return player && player.name;
  //};



  //Template.player.selected = function () {
  //  return Session.equals("selected_player", this._id) ? "selected" : '';
  //};
  //Template.leaderboard.events({
  //  'click input.inc': function () {
  //   Players.update(Session.get("selected_player"), {$inc: {score: 5}});
  //  }
  //});
  //Template.player.events({
  //  'click': function () {
  //    Session.set("selected_player", this._id);
  // }
  //});


  Template.contacts_view.events({
      'click #add_new_contact': function() {
        Contacts.insert(
          { 
            name:   document.getElementById('new_contact_name').value,
            address:document.getElementById('new_contact_address').value
          });
        document.getElementById('new_contact_name').value = "";
        document.getElementById('new_contact_address').value = "";
      }
  });





}


// On server startup, create some contacts if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Contacts.find().count() === 0) {
      var contacts = 
      		[{name: "My Brother",address: "79 Brighton"},
           {name: "My Sister", address: "Not Born Yet"},
           {name: "My Father", address: "201 Brighton"}, 
           {name: "My Mother", address: "79 Brighton"} ];
      for (var i = 0; i < contacts.length; i++) {
        Contacts.insert(contacts[i]);
      }
    }
  });
}