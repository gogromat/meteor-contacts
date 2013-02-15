//todo check later
Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("lists", function () {
  return Lists.find(
    {$or: [{owner: this.userId}]}); //{"public": true}
});

// todo: return only those contacts, 
// whose list_ids belong to lists that belong to userId
Meteor.publish("contacts", function () {
  return Contacts.find({});
});