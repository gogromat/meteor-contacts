// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Contacts = new Meteor.Collection("contacts");


if (Meteor.isClient) {


  Template.contacts_view.contacts = function () {

    return Contacts.find({}, {sort: {name: 1}});//, address: 1
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
        var name    = document.getElementById('new_contact_name').value;
        var address = document.getElementById('new_contact_address').value;
        if (name === "") {
          return false;
        }
        if (address === "") {
          Contacts.insert({name:name});
        } else {
          Contacts.insert({name:name,addresses:[{street:address}]});
        }
        document.getElementById('new_contact_name').value = "";
        document.getElementById('new_contact_address').value = "";
      }
  });


  // This is a transformation funciton that takes our
  // array of addresses for a person and returning a new object that 
  // containt an id of the contact in it as well for further manipulation
  Template.contact_item.address_objs = function () {
    var contact_id = this._id;
    return _.map(this.addresses || [], function (address) {
      return {contact_id : contact_id, street : address.street};
    });
  };


  Template.contact_item.events({
      'click .remove-contact': function() {
        Contacts.remove(this._id);
      },
      'click .add_another_address': function() {
        var id = this._id;
        var address = document.getElementById(this._id + '_add_address').value;
        if (address === "") {
          return false;
        }
        Contacts.update(id, { $push : { addresses: { street : address } } });
        document.getElementById(this._id + '_add_address').value = "";
      },
      'click .remove-address': function(evt) {
        var id  = this.contact_id,
            street = this.street;
        Contacts.update(
          {_id:id}, 
          {$pull: {addresses : {"street" : street} } });
      },
      'blur .contact-name': function(evt) {
        var id  = this._id,
            old_name = this.name,
            new_name = evt.target.value;
        if (old_name !== new_name) {
          Contacts.update(id,{$set : {name : new_name}});
        }
      },
      'blur .contact-address': function(evt) {
        var id = this.contact_id,
            old_street = this.street,
            new_street = evt.target.value;
        if (old_street !== new_street) {
          Contacts.update(id,{ $pull : {addresses : {"street": old_street} } });
          Contacts.update(id,{ $push : {addresses : {"street": new_street} } });
        }

      }
  });



  Template.address_filter.addresses = function() {
    var addresses = [];
    var total_count = 0;

    Contacts.find({}).forEach(function(contact) {
      _.each(contact.addresses, function(contact_address) {
        var new_street = _.find(addresses, function (address) { return address.street === contact_address.street;});
        if (! new_street) {
          addresses.push({street: contact_address.street, count: 1});
        } else {
          new_street.count++;
        }
      });
      total_count++;
    });
    //sorts by how many times same address repeats (not best, but ok)
    addresses = _.sortBy(addresses, function(address) { return address.street; });
    //also add one empty
    addresses.unshift({street: null, count: total_count});
    return addresses;
  }

  Template.address_filter.streets = function () {
    return this.street || "All streets";
  };



}


// On server startup, create some contacts if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Contacts.find().count() === 0) {
      var contacts = 
      		[
            {"name": "My Brother","addresses": [
                                    {"street":"79 Brighton"}
                                               ]  },
            {"name": "My Sister", "addresses": [
                                    {"street":"Not Born Yet"}
                                               ] },
            {"name": "My Father", "addresses": [
                                    {"street":"201 Brighton"}
                                               ] }, 
            {"name": "My Mother", "addresses": [
                                    {"street":"79 Brighton"}]  
                                                 } 
          ];
      for (var i = 0; i < contacts.length; i++) {
        Contacts.insert(contacts[i]);
      }
    }
  });
}