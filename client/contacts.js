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

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Meteor.subscribe("users");
Meteor.subscribe("contacts");
//Meteor.subscribe("lists");


Meteor.startup(function(){
  /*
  all_user_contacts = Contacts.find({});
  console.log(all_user_contacts.fetch());
  all_user_contacts.observeChanges({
    added: function (id, contact) {
      console.log("Added 1 contact", contact, id);
    },
    removed: function (id) {
      console.log("Removed 1 contact", id);
    }
  });*/
});


// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
Meteor.subscribe("lists", function() {
  //if (!Session.get("lists_filter")) {
    //var list = Lists.findOne({}, {sort : {name: 1}});
    //todo: Routes
  //}
});

// Always be subscribed to the contacts for the selected list.
Meteor.autorun(function () {
  var lists_filter = Session.get('selected_list_id');
  if (lists_filter) {
    Meteor.subscribe('contacts', lists_filter);
  }
});


/*
  TODO: autorun to contacts changed by session's list 
  TODO: remove update from lists/contacts
 */


// Banner for users who are not logged in
Template.not_logged_in.logged_in = function () {
  if (Meteor.userId()) {
    return true;
  } 
  return false;
}


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

  var contacts;

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
    contacts = Contacts.find(me, {sort: {name: 1}}); 
  }

  return contacts;
};


Template.contacts_view.contacts_view_type = function () {
  return Session.get('contacts_view_type') === 'grid' ? 'contacts_view_type' : '';
};


Template.contacts_view.events({
    'click #add_new_contact, keydown #new_contact_name, keydown #new_contact_address, keydown #new_contact_phone': function(evt) {
      if (evt.which === undefined || evt.which === 13) {        
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

        Meteor.call("add_contact", new_contact_item);

        Session.set('address_filter', null);
        Session.set('phone_filter', null);
        new_contact.val("");
        new_address.val("");
        new_phone.val("");
      }
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
      Meteor.call("remove_contact",this._id);
    },
    'click .add_another_address, blur .add_another_address_input, keydown .add_another_address_input': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this._id,
            new_address = $("#" + this._id + '_add_address'),
            new_street  = new_address.val().trim();
        if (new_street === "") {
          return false;
        }
        var isAddressSet = Contacts.findOne({_id: id, "addresses": {"street":new_street}});
        if (!isAddressSet) {
          Meteor.call("change_address",id,new_street,'add');
        }
        new_address.val("");
      }
    },
    'click .remove-address': function() {
      var id  = this.contact_id,
          street = this.street;
      Meteor.call("change_address",id,street,'remove');
    },
    'click .add_another_phone, blur .add_another_phone_input, keydown .add_another_phone_input': function (evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this._id,
            new_phone  = $("#" + this._id + '_add_phone'),
            new_number = new_phone.val().trim();
        if (new_number === "") {
          return false;
        }
        var isPhoneSet = Contacts.findOne({_id: id, "phones": {"number":new_number}});
        if (!isPhoneSet) {
          Meteor.call("change_phone", id, new_number,'add');
        }
        new_phone.val("");
      }
    },
    'click .remove-phone': function() {
      var id     = this.contact_id,
          number = this.number;
      Meteor.call("change_phone", id, number, 'remove');
    },
    'blur .contact-name, keydown .contact-name': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id  = this._id,
            old_name = this.name,
            new_name = evt.target.value.trim();
        if (old_name !== new_name) {
          if (new_name !== "") {
            Meteor.call("change_name",id,new_name,"change")
          } else {
            Meteor.call("remove_contact", id);
          }
        }
      }
    },
    'blur .contact-address, keydown .contact-address': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this.contact_id,
            old_street = this.street,
            new_street = evt.target.value.trim();
        if (old_street !== new_street) {
          Meteor.call("change_address",id, old_street, 'remove');
          if (new_street !== "") {
            Meteor.call("change_address",id, new_street, 'add');
          }
          Session.set('address_filter', null);
        }
      }
    },
    'blur .contact-phone, keydown .contact-phone': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this.contact_id,
            old_number = this.number,
            new_number = evt.target.value.trim();
        if (old_number !== new_number) {
          Meteor.call("change_phone",id, old_number, 'remove');
          if (new_number !== "") {
            Meteor.call("change_phone",id, new_number, 'add');
          }
          Session.set('phone_filter', null);
        }
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

  contacts.forEach(function(contact) {
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


Template.address_filter.events({
  'mousedown .address-filter': function() {
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
    var value = evt.target.value.trim();
    Session.set('address_filter',null);
    Session.set('phone_filter',  null);
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

  contacts.forEach(function(contact) {
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


Template.phone_filter.events({
  'mousedown .phone-filter': function() {
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
  return this.list_name || (!Meteor.userId() ? "Public Contacts" : "All My Contacts");
};

Template.lists_filter.selected = function () {
  var id = null;
  if (this._id) {
    id = this._id;
  }
  return Session.equals('selected_list_id', id) ? 'list-selected' : 'list-unselected';
};


Template.lists_filter.events({
  'mousedown .lists-filter' : function() {//evt, tmpl
    var id = null;
    if (this._id) {
      id = this._id;
    }
    Session.set('address_filter',  null);
    Session.set('phone_filter',    null);
    Session.set('search_contacts', null);
    $('#search_contacts').val("");
    // make sure blur occurs
    Meteor.setTimeout(function() {
      Session.set('selected_list_id', id);
    },50);
    Meteor.flush();
  },
  'click .add-list, blur #new_list_name, keydown #new_list_name' : function(evt) {
    if (evt.which === undefined || evt.which === 13) {
      var new_list = $('#new_list_name'),
          new_list_name = new_list.val().trim();

      if (new_list_name !== "") {
        var new_list_id = 0;
        Meteor.setTimeout(function () {
          new_list_id = Meteor.call("add_list", new_list_name);
          Meteor.setTimeout(function () {
            Session.set("selected_list_id", new_list_id);
          }, 300);
        }, 300);
        new_list.val("");
      }
    }
  },
  'blur .list-selected' : function (evt) {
    var id = this._id,
        old_name = this.list_name,
        new_name = evt.target.value.trim();
    if (new_name && id && old_name !== new_name) {
        Meteor.call("change_list_name", id, new_name);
    }
  },
  'click .remove-list' : function() {
    var list_id = this._id;
    Contacts.find({"lists":{"list_id": list_id}}).forEach(function(contact) {
      if (_.size(contact.lists) > 1) {
        // Contact on multiple lists
        Meteor.call("remove_list_from_contacts",list_id);
      } else {
        Meteor.call("remove_contact",contact._id);
      }
    });
    Meteor.call("remove_list", list_id);
  }
});