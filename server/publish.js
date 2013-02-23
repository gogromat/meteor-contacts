//todo check later
Meteor.publish("users", function () {
	return getUsers();
});

Meteor.publish("lists", function () {
	return getLists(this.userId);
});


// todo: return only those contacts, 
// whose list_ids belong to lists that belong to userId or public (everyone)
Meteor.publish("contacts", function () {
  var list_ids = _.pluck(getLists(this.userId).fetch(), '_id');
  	  //account for Public List
  	  list_ids.push(null);
  
  contacts = Contacts.find({"lists.list_id": {$in: list_ids}});

  return contacts;
});


function getLists(userId) {
  var owner = {owner: userId} || {owner: null};
  return Lists.find(owner);
}

function getUsers() {
	return Meteor.users.find({}
  						   //what fields are accessible by the client
  						   //, profile: 0
  						   ,{fields: {emails: 1}
  						   }
  						  );
}


Meteor.publish("count_total_users", function () {
	var self  = this,
		count = 0,
		initializing = true;
	
	var handle = getUsers().observeChanges({
		added: function (id) {
			count++;
			if (!initializing) {
				self.changed("counts", 2, {counts: count});
			}
		},
		removed: function (id) {
			count--;
			self.changed("counts", 2, {counts: count});
		}
	});

	initializing = false;
	self.added("counts", 2, {counts: count});
	self.ready();

	self.onStop(function() {
		handle.stop();
	});
});