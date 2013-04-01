/* FILTERS BY ADDRESS */
Template.email_filter.helpers({
  selected: function() {
    return Session.equals("email_filter", this.address) ? 'bg-color-greenLight ' : 'bg-color-gray';
  }
});

Template.email_filter.emails = function() {
  var emails = [];
  var contact_count = 0;
  var list_id = Session.get('selected_list_id');

  if (!list_id) {
    contacts = Contacts.find({});
  } else {
    contacts = Contacts.find({"lists":{"list_id": Session.get('selected_list_id')}});
  }

  contacts.forEach(function(contact) {
    _.each(contact.emails, function(contact_email) {
      // find if we inserted street object already into 'emails'
      var old_email = _.find(emails, function (email) { return email.address === contact_email.address;});
      if (!old_email) {
        // push new object
        emails.push({address: contact_email.address, count: 1});
      } else {
        old_email.count++;
      }
    });
    contact_count++;
  });
  //sorts by how many times same address repeats (not best, but ok)
  emails = _.sortBy(emails, function(email) { return email.address; });
  //also add one empty
  emails.unshift({address: null, count: contact_count});
  return emails;
}


Template.email_filter.events({
  'mousedown .email_filter': function() {
    if (Session.equals('email_filter', this.address)) {
      Session.set('email_filter', null);
    } else {
      Session.set('email_filter', this.address);
    }
  }
});