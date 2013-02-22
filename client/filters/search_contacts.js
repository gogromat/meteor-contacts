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