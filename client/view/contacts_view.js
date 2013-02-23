/*
  TODO: autorun to contacts changed by session's list 
  TODO: remove update from lists/contacts
 */

Template.contacts_view.helpers({
  contacts_view_type: function () {
    return Session.get('contacts_view_type') === 'grid' ? 'contacts_view_type' : '';
  }
});

Template.contacts_view.contacts = function () {

  var me = {};

  // LIST
  var list_id = Session.get('selected_list_id');
  
  if (list_id) {
    me.lists = {"list_id":list_id};
  }


  // ADDRESS
  // var address_filter = Session.get('address_filter');
  // if (address_filter) {
  //   me.addresses = {"street":address_filter};
  // }
  // PHONES
  // var phone_filter = Session.get('phone_filter');
  // if (phone_filter) {
  //   me.phones = {"number":phone_filter};
  // }
  // EMAILS
  // var email_filter = Session.get('email_filter');
  // if (email_filter) {
  //   me.emails = {"address":email_filter};
  // }



  var contacts;

  // SEARCH ALL FIELDS
  if ( Session.get('search_contacts') ) {
    // Search by text
    var pattern = new RegExp(search_contacts,"i"),
        contacts = Contacts.find({$where : 
          function() { 
            var street_equal = false,
                number_equal = false,
                email_equal  = false;
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
            _.each(this.emails, function(email) {      
              if (pattern.test(email.address)) {
                email_equal = true;
              }
            });
            return (pattern.test(this.name) || street_equal === true || email_equal === true || number_equal === true);
          } 
        }, {sort: {name: 1}} );
  } else {
    // Search by tags
    me = setObjectInnerArray(me, "addresses", "street",  Session.get('address_filter'));
    me = setObjectInnerArray(me, "phones",    "number",  Session.get('phone_filter'));
    me = setObjectInnerArray(me, "emails",    "address", Session.get('email_filter'));
    contacts = Contacts.find(me, {sort: {name: 1}}); 
  }

  return contacts;
};

Template.contacts_view.events({
    'click #add_new_contact, keydown #new_contact_name, keydown #new_contact_address, keydown #new_contact_phone': function(evt) {
      if (evt.which === 1 || evt.which === 13) {        
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