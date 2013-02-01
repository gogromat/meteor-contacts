// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Contacts = new Meteor.Collection("contacts");
Lists    = new Meteor.Collection("lists");


if (Meteor.isClient) {

  // Name of currently selected tag for filtering
  Session.set('address_filter', null);
  Session.set('lists_filter', null);



  Template.contacts_view.contacts = function () {

    var me = {};

    var address_filter = Session.get('address_filter');
    console.log(address_filter);

    if (address_filter) {
      me.addresses = {"street":address_filter};
    }

    //console.log(me);

    return Contacts.find(me, {sort: {name: 1}});//, address: 1
  };


  Template.contacts_view.events({
      'click #add_new_contact': function() {
        var name    = document.getElementById('new_contact_name').value;
        var address = document.getElementById('new_contact_address').value;
        if (name === "") {
          return false;
        }
        if (address === "") {
          Contacts.insert({
            name : name,
            list_id : Session.get('lists_filter')});
        } else {
          Contacts.insert({
            name : name,
            addresses : [{street:address}],
            list_id : Session.get('lists_filter')});
        }
        Session.set('address_filter', null);
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



  /* FILTERS */

      /* BY ADDRESS */
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


      /* BY LISTS */
  Template.lists_filter.lists = function() {
    var lists = [];

    Lists.find({}).forEach(function(list) {
      lists.push(list);
    });

    lists.unshift({list_name: null});
    return lists;
    //todo: add count
  }

  Template.lists_filter.list_name = function () {
    return this.list_name || "Global List";
  };


  Template.lists_filter.events({
    'mousedown .lists-filter': function(env) {
      if (Session.equals('lists-filter', this._id)) {
        Session.set('lists-filter', 1);
      } else {
        Session.set('lists-filter', this._id);
      }
    }
  });




  Template.address_filter.events({
    'mousedown .address-filter': function(env) {
      if (Session.equals('address_filter', this.street)) {
        Session.set('address_filter', null);
      } else {
        Session.set('address_filter', this.street);
      }
    }
  });




}


// On server startup, create some contacts if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Lists.find().count() === 0) {
      var family_list_id  = Lists.insert({"list_name":"Friends"});
      var friends_list_id = Lists.insert({"list_name":"Friends"});
    }
    if (Contacts.find().count() === 0) {
      var contacts = 
      		[
            {"name": "My Brother","addresses": [
                                    {"street":"79 Brighton 11th St"},{"street":"201 Brighton 1st Rd"}
                                               ], 
                                  "lists" :    [
                                   {"list_id": family_list_id}
                                               ]  
            },
            {"name": "Me",        "addresses": [
                                    {"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}
                                               ], 
                                  "lists" :    [
                                   {"list_id": family_list_id}
                                               ]  
            },
            {"name": "My Father", "addresses": [
                                    {"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}
                                               ], 
                                  "lists" :    [
                                   {"list_id": family_list_id}
                                               ]  
            },       
            {"name": "My Mother", "addresses": [
                                    {"street":"79 Brighton 11th St"}
                                               ], 
                                  "lists" :    [
                                   {"list_id": family_list_id}
                                               ]  
            },
            {"name": "Max Godko", "addresses": [
                                    {"street":"Avenue U"}
                                               ], 
                                  "lists" :    [
                                   {"list_id": friends_list_id}, {"list_id":family_list_id}
                                               ]  
            }
          ];
      for (var i = 0; i < contacts.length; i++) {
        Contacts.insert(contacts[i]);
      }
    }
  });
}