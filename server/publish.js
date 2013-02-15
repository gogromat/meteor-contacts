//todo check later
Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});


Meteor.publish("lists", function () {
	return getLists(this.userId);
//Lists.find({});
});

// todo: return only those contacts, 
// whose list_ids belong to lists that belong to userId or public (everyone)
Meteor.publish("contacts", function () {
  var list_ids = _.pluck(getLists(this.userId).fetch(), '_id');
  	  //account for Public List
  	  list_ids.push(null);
  
  //var contact_lists = _.map(list_ids,function(id) {
  //	return {list_id: id};
  //});

  contacts = Contacts.find({"lists.list_id": {$in: list_ids}});

  return contacts;
});


function getLists(userId) {
  return Lists.find({$or: [{owner: userId}, {owner: null}]});
}