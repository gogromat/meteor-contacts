// Name of currently selected list
Session.set('selected_list_id', null);

// Name of currently selected address tag for filtering
Session.set('address_filter', null);

// Name of currently selected phone tag for filtering
Session.set('phone_filter', null);

// Name of currently selected email tag for filtering
Session.set('email_filter', null);

// Search by name, address, phone
Session.set('search_contacts', null);

// Contact view
Session.set('contacts_view_type', 'grid');

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Meteor.subscribe("users");
Meteor.subscribe("contacts");
Meteor.subscribe("lists", function() {});

// Always be subscribed to the contacts for the selected list.
Meteor.autorun(function () {
  var lists_filter = Session.get('selected_list_id');
  if (lists_filter) {
    Meteor.subscribe('contacts', lists_filter);
  }

  Meteor.subscribe("count_total_users", 2);
});