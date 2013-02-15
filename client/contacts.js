// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Lists    = new Meteor.Collection("lists");
Contacts = new Meteor.Collection("contacts");


//if (Meteor.isClient) {

  // Name of currently selected list
  Session.set('selected_list_id', null);

  // Name of currently selected address tag for filtering
  Session.set('address_filter', null);

  // Name of currently selected phone tag for filtering
  Session.set('phone_filter', null);

  // Search by name, address, phone
  Session.set('search_contacts', null);

  // Contact view
  Session.set('contacts_view_type', 'grid');


  // Subscribe to 'lists' collection on startup.
  // Select a list once data has arrived.
  Meteor.subscribe("lists", function() {
    if (!Session.get("lists_filter")) {
      var list = Lists.findOne({}, {sort : {name: 1}});
      //todo: Routes
    }
  });

  // Always be subscribed to the contacts for the selected list.
  Meteor.autosubscribe(function () {
    var lists_filter = Session.get('selected_list_id');
    if (lists_filter)
      Meteor.subscribe('contacts', lists_filter);
  });




  //todo
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

    // PHONES
    var phone_filter = Session.get('phone_filter');
    if (phone_filter) {
      me.phones = {"number":phone_filter};
    }

    // SEARCH ALL FIELDS
    var search_contacts = Session.get('search_contacts');
    if (search_contacts) {
      var pattern = new RegExp(search_contacts,"i"),
          contacts = Contacts.find({$where : 
            function() { 
              var street_equal = false,
                  number_equal = false;
              _.each(this.addresses, function(address) {      
                if (pattern.test(address.street)) {
                  street_equal = true;
                }
              });
              _.each(this.phones, function(phone) {      
                if (pattern.test(phone.number)) {
                  number_equal = true;
                }
              });
              return (pattern.test(this.name) || street_equal == true || number_equal == true);
            } 
          }, {sort: {name: 1}} );
    } else {
      var contacts = Contacts.find(me, {sort: {name: 1}}); 
    }


    //console.log(me,contacts.collection.docs);
    return contacts;//Contacts.find();
  };


  Template.contacts_view.contacts_view_type = function () {
    return Session.get('contacts_view_type') === 'grid' ? 'contacts_view_type' : '';
  };


  Template.contacts_view.events({
      'click #add_new_contact': function() {
        console.log('adding new contact...');
        var new_contact = $("#new_contact_name"), 
            name        = new_contact.val(),
            new_address = $("#new_contact_address"),
            address     = new_address.val().trim(),
            new_phone   = $("#new_contact_phone"),
            phone       = new_phone.val().trim(),
            new_contact_item = {};

        if (name === "") {
          return false;
        } else {
          new_contact_item.name = name;
          new_contact_item.lists = [{list_id : Session.get('selected_list_id')}];
        }
        if (address !== "") {
          new_contact_item.addresses = [{street: address}];
        }
        if (phone !== "") {
          new_contact_item.phones = [{number: phone}];
        }
        Contacts.insert(new_contact_item);

        Session.set('address_filter', null);
        Session.set('phone_filter', null);
        new_contact.val("");
        new_address.val("");
        new_phone.val("");
      },
      'click .contact_list_view': function() {
        Session.set('contacts_view_type', 'list');
      },
      'click .contact_grid_view': function() {
        Session.set('contacts_view_type', 'grid');
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

  Template.contact_item.phones_objs = function () {
    var contact_id = this._id;
    return _.map(this.phones || [], function (phone) {
      return {contact_id : contact_id, number : phone.number};
    });
  };

  Template.contact_item.contacts_view_type = function () {
    return Session.get('contacts_view_type') === 'list' ? '' : 'contacts_view_type';
  };


  Template.contact_item.events({
      'click .remove-contact': function() {
        console.log('c');
        Contacts.remove(this._id);
      },
      'click .add_another_address': function() {
        console.log('add another address');
        var id = this._id,
            new_address = $("#" + this._id + '_add_address'),
            new_street  = new_address.val().trim();
        if (new_street === "") {
          return false;
        }
        // street already exists?
        var isAddressSet = Contacts.findOne({_id: id, "addresses": {"street":new_street}});
        if (!isAddressSet) {
          Contacts.update(id, { $push : { addresses: { street : new_street } } });
        }
        new_address.val("");
      },
      'click .remove-address': function(evt) {
        console.log('removing address...');
        var id  = this.contact_id,
            street = this.street;
        Contacts.update(
          {_id:id}, 
          {$pull: {addresses : {"street" : street} } });
      },
      'click .add_another_phone': function () {
        console.log('add another phone');
        var id = this._id,
            new_phone  = $("#" + this._id + '_add_phone'),
            new_number = new_phone.val().trim();
        if (new_number === "") {
          return false;
        }
        // street already exists?
        var isPhoneSet = Contacts.findOne({_id: id, "phones": {"number":new_number}});
        if (!isPhoneSet) {
          Contacts.update(id, { $push : { phones: { number : new_number } } });
        }
        new_phone.val("");
      },
      'click .remove-phone': function(evt) {
        console.log('removing phone...');
        var id     = this.contact_id,
            number = this.number;
        Contacts.update(
          {_id:id}, 
          {$pull: {phones : {"number" : number} } });
      },
      'blur .contact-name': function(evt) {
        var id  = this._id,
            old_name = this.name,
            new_name = evt.target.value;
        if (old_name !== new_name) {
          if (new_name !== "") {
            Contacts.update(id,{$set : {name : new_name}});
          } else {
            Contacts.remove({_id:id}, 1);
          }
        }
      },
      'blur .contact-address': function(evt) {
        var id = this.contact_id,
            old_street = this.street,
            new_street = evt.target.value;
        if (old_street !== new_street) {
          Contacts.update(id,{ $pull : {addresses : {"street": old_street} } });
          if (new_street !== "") {
            Contacts.update(id,{ $push : {addresses : {"street": new_street} } });
          }
          Session.set('address_filter', null);
        }
      },
      'blur .contact-phone': function(evt) {
        var id = this.contact_id,
            old_number = this.number,
            new_number = evt.target.value;
        if (old_number !== new_number) {
          Contacts.update(id,{ $pull : {phones : {"number": old_number} } });
          if (new_number !== "") {
            Contacts.update(id,{ $push : {phones : {"number": new_number} } });
          }
          Session.set('phone_filter', null);
        }
      }
  });















  /* FILTERS */






      /* BY ADDRESS */
  Template.address_filter.addresses = function() {
    var addresses = [];
    var contact_count = 0;
    var list_id = Session.get('selected_list_id');

    if (!list_id) {
      contacts = Contacts.find({});
    } else {
      contacts = Contacts.find({"lists":{"list_id": Session.get('selected_list_id')}});
    }
    //console.log("All contacts are:",contacts);

    // iterate mongo.db contacts
    contacts.forEach(function(contact) {
      // iterate contacts' addresses
      _.each(contact.addresses, function(contact_address) {
        // find if we inserted street object already into 'addresses'
        var old_street = _.find(addresses, function (address) { return address.street === contact_address.street;});
        if (!old_street) {
          // push new object
          addresses.push({street: contact_address.street, count: 1});
        } else {
          old_street.count++;
        }
      });
      contact_count++;
    });
    //sorts by how many times same address repeats (not best, but ok)
    addresses = _.sortBy(addresses, function(address) { return address.street; });
    //also add one empty
    addresses.unshift({street: null, count: contact_count});
    return addresses;
  }

  // Template.address_filter.streets = function () {return this.street || "All addresses";};

  Template.address_filter.events({
    'mousedown .address-filter': function(evt) {
      if (Session.equals('address_filter', this.street)) {
        Session.set('address_filter', null);
      } else {
        Session.set('address_filter', this.street);
      }
    }
  });

  Template.address_filter.selected = function() {
    return Session.equals("address_filter", this.street) ? 'bg-color-greenLight ' : '';
  }



    /* BY EVERYTHING */
  Template.search_contacts.events({
    'keyup #search_contacts': function(evt) {
      Session.set('address_filter',null);
      Session.set('phone_filter',  null);
      var value = evt.target.value.trim();
      if (Session.equals('search_contacts', value)) {
        Session.set('search_contacts', null);
      } else {
        Session.set('search_contacts', value);
      }
    },
    'click #delete-search-contacts' : function() {
      $('#search_contacts').val(" ");
      Session.set('search_contacts', null);
    }
  });




    /* BY PHONES */
  Template.phone_filter.phones = function() {
    var phones = [];
    var contact_count = 0;
    var list_id = Session.get('selected_list_id');

    if (!list_id) {
      contacts = Contacts.find({});
    } else {
      contacts = Contacts.find({"lists":{"list_id": Session.get('selected_list_id')}});
    }
    //console.log("All contacts are:",contacts);

    // iterate mongo.db contacts
    contacts.forEach(function(contact) {
      // iterate contacts' addresses
      _.each(contact.phones, function(contact_phone) {
        // find if we inserted street object already into 'addresses'
        var old_phone = _.find(phones, function (phone) { return phone.number === contact_phone.number;});
        if (!old_phone) {
          // push new object
          phones.push({number: contact_phone.number, count: 1});
        } else {
          old_phone.count++;
        }
      });
      contact_count++;
    });
    //sorts by how many times same address repeats (not best, but ok)
    phones = _.sortBy(phones, function(phone) { return phone.number; });
    //also add one empty
    phones.unshift({number: null, count: contact_count});
    return phones;
  }
 
  // Template.phone_filter.numbers = function () {return this.number || "";};

  Template.phone_filter.events({
    'mousedown .phone-filter': function(evt) {
      if (Session.equals('phone_filter', this.number)) {
        Session.set('phone_filter', null);
      } else {
        Session.set('phone_filter', this.number);
      }
    }
  });

  Template.phone_filter.selected = function() {
    return Session.equals("phone_filter", this.number) ? 'bg-color-greenLight ' : '';
  }







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
    return Session.equals('selected_list_id', id) ? 'list-selected' : 'list-unselected';
  };


  Template.lists_filter.events({
    'mousedown .lists-filter' : function(evt, tmpl) {
      id = null;
      if (this._id) {
        id = this._id;
      }
      Session.set('selected_list_id', id);
      Session.set('address_filter',   null);
      Session.set('phone_filter',     null);
      Session.set('search_contacts',  null);
      $('#search_contacts').val("");
      Meteor.flush();
    },
    'click  .add-list' : function(evt) {

      var new_list = $('#new_list_name'),
          new_list_name = new_list.val().trim();

      if (new_list_name !== "") {
        var new_list_id = 0;
        Meteor.setTimeout(function () {
          new_list_id = Lists.insert({"list_name": new_list_name});
          Meteor.setTimeout(function () {
            Session.set("selected_list_id", new_list_id);
          }, 300);
        }, 300);
        new_list.val("");
      }
    },
    'click .remove-list' : function(evt) {
      console.log('removing list...');
      list_id = this._id;
      Contacts.find({"lists":{"list_id": list_id}}).forEach(function(contact) {
        if (_.size(contact.lists) > 1) {
          // Contact on multiple lists
          Contacts.remove({"lists":{"list_id": list_id}});
        } else {
          // Contact on this list only
          Contacts.remove({_id:contact._id}, 1);
        }
      });
      // Delete from Lists
      //list = Lists.find({_id: list_id});
      Lists.remove({_id: list_id});
    }
  });
//}