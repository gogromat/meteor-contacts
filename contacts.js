// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Lists    = new Meteor.Collection("lists");
Contacts = new Meteor.Collection("contacts");


if (Meteor.isClient) {

  // Name of currently selected list
  Session.set('selected_list_id', null);

  // Name of currently selected address tag for filtering
  Session.set('address_filter', null);


  // Subscribe to 'lists' collection on startup.
  // Select a list once data has arrived.
  Meteor.subscribe("lists", function() {
    if (!Session.get("lists_filter")) {
      var list = Lists.findOne({}, {sort : {name: 1}});
      //todo: Routes
    }
  });

  // Always be subscribed to the contacts for the selected list.
  /*Meteor.autosubscribe(function () {
    var lists_filter = Session.get('selected_list_id');
    if (lists_filter)
      Meteor.subscribe('contacts', lists_filter);
  });*/













  Template.contacts_view.contacts = function () {

    var me = {};

    // LIST
    var list_id = Session.get('selected_list_id');
    
    if (list_id) {
      me.lists = {"list_id":list_id};
    }

    // ADDRESS
    var address_filter = Session.get('address_filter');
    if (address_filter) {
      me.addresses = {"street":address_filter};
    }

    var contacts =  Contacts.find(me, {sort: {name: 1}}); 
    //console.log(me,contacts.collection.docs);
    return contacts;
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
            lists: { "list_id" : Session.get('selected_list_id')}}
            );
        } else {
          Contacts.insert({
            name : name,
            addresses : [{street:address}],
            lists: { "list_id" : Session.get('selected_list_id')}}
            );
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
    var list_id = Session.get('selected_list_id');

    if (!list_id) {
      contacts = Contacts.find({});
    } else {
      contacts = Contacts.find({"lists":{"list_id": Session.get('selected_list_id')}});
    }
    //console.log("All contacts are:",contacts);

    contacts.forEach(function(contact) {
      _.each(contact.addresses, function(contact_address) {
        var new_street = _.find(addresses, function (address) { return address.street === contact_address.street;});
        if (!new_street) {
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

  Template.address_filter.events({
    'mousedown .address-filter': function(env) {
      if (Session.equals('address_filter', this.street)) {
        Session.set('address_filter', null);
      } else {
        Session.set('address_filter', this.street);
      }
    }
  });













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
    return this.list_name || "All Contacts";
  };

  Template.lists_filter.selected = function () {
    var id = null;
    if (this._id) {
      id = this._id;
    }
    return Session.equals('selected_list_id', id) ? 'selected' : '';
  };


  Template.lists_filter.events({
    'mousedown .lists-filter' : function(env, tmpl) {
      id = null;
      if (this._id) {
        id = this._id;
      }
      Session.set('selected_list_id', id);
      console.log('Click on list ', id, 'Setting session list_id to ',id);
      Meteor.flush();
    },
    'click  .add-list' : function(env) {
      var new_list_name = document.getElementById('new_list_name').value;
      if (new_list_name !== "") {
        var new_list_id = 0;
        Meteor.setTimeout(function() {
          new_list_id = Lists.insert({"list_name":new_list_name});
          Meteor.flush();
          Meteor.setTimeout(function() {
            Session.set("lists_filter",new_list_id);
          },300);
        },300);
        //todo: fix
        document.getElementById('new_list_name').value = "";
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
            {"name": "My Brother",
             "addresses": [{"street":"79 Brighton 11th St"},{"street":"201 Brighton 1st Rd"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },
            {"name": "Me",        
             "addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },
            {"name": "My Father", 
             "addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },       
            {"name": "My Mother", 
             "addresses": [{"street":"79 Brighton 11th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },
            {"name": "Max Godko", 
             "addresses": [{"street":"Avenue U"}], 
             "lists"    : [{"list_id": friends_list_id}, {"list_id":family_list_id}]  
            }
          ];
      for (var i = 0; i < contacts.length; i++) {
        Contacts.insert(contacts[i]);
      }
      //Contacts.insert({"name": "Max Godko","addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}],"lists":[{"list_id": 1}]});
    }
  });
}