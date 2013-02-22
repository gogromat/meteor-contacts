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