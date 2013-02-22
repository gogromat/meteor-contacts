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
 // console.log("Current user #:", 
 //             Counts.findOne().counts,
 //             Counts.findOne().count, 
 //             " counts,", 
 //             Counts.find().fetch());
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

  Meteor.subscribe("count_total_users", 2);
});