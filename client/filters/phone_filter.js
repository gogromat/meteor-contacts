  /* FILTER BY PHONES */
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
