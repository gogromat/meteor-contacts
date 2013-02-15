// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".
Lists    = new Meteor.Collection("lists");
Contacts = new Meteor.Collection("contacts");

Lists.allow({
  insert: function () {
    return false;
  },
  update: function (userId, lists, fields, modifiers) {
    return _.all(lists, function(list) {
      // the same owner
      console.log("UPDATING LIST!");
      if (list.owner === userId) {
        return true;
      }         
    });
  },
  remove: function (userId, lists) {
    return _.all(lists, function(list) {
      // the same owner
      if (list.owner === userId) {
        return true;
      }
    });
  }
});

Contacts.allow({
  insert: function () {
    return true;
  },
  update: function (userId, contacts, fields, modifiers) {
    return _.all(contacts, function(contact) {
      console.log("CONTACT:",contact);
      // the same owner
      if (contact.owner === userId || !(contact.owner)) {
        return true;
      }
      return false;         
    });
  },
  remove: function (userId, contacts) {
    return false;
  }
});



// On server startup, create some contacts if the database is empty.
//if (Meteor.isServer) {

  Meteor.methods({
    add_list: function (name) {
      var userId = this.userId;

      if (!name) {
        throw new Meteor.Error(400, "Name parameter is missing");
      } else if (!userId) {
        throw new Meteor.Error(403, "You must be logged in");
      }
      console.log("Trying to insert new list...",name);

      inserted =  Lists.insert({
        owner: userId,
        list_name: name 
      }); 


      user_lists = Lists.find({owner: userId}).fetch();

      console.log(user_lists, inserted);

      return inserted;
    },
    add_contact: function (contact_item) {
      var userId = this.userId;

      if (!contact_item) {
        throw new Meteor.Error(400, "No contact was provided");
      } else if (!contact_item.name) {
        throw new Meteor.Error(401, "No contact name was provided");
      }

      //todo: throw error
      if (!(_.all(contact_item.lists, function (contact_list) {
            return (_.all(Lists.find({_id: contact_list.list_id}).fetch(), function(element) {
                      if (element.owner === userId) { return true; } }));
          }))
        ) {
        throw new Meteor.Error(403, "Wrong User");
      }

      console.log("Trying to insert new contact...",contact_item);
      contact = Contacts.insert(contact_item);
      return contact;
    },
    remove_list: function (list_id) {
      var userId = this.userId,
          list = Lists.findOne(list_id);

      if (!list_id || !list) {
        throw new Meteor.Error(400, "No list was selected");
      }

      Lists.remove({_id:list_id});
    },
    remove_contact: function (contact_id) {
      var userId = this.userId,
          contact_item = Contacts.findOne(contact_id);

      if (!contact_id || !contact_item) {
        throw new Meteor.Error(400, "No contact was selected");
      }

      //todo: throw error
      if (!(_.all(contact_item.lists, function (contact_list) {
            console.log("LIST:",contact_list);
            var lists = [];
            if (contact_list) {
              lists = Lists.find({_id: contact_list.list_id}).fetch();
            }
            lists.push({_id:null});

            return(_.all(lists, function(element) {
                      console.log(element);
                      if (element._id === null || element.owner === userId) { 
                        return true; 
                      } return false; 
                    }) );
          })) ) {
        throw new Meteor.Error(403, "Wrong User");
      }
      console.log("Trying to remove contact...", contact_id);
      Contacts.remove({_id:contact_id});
    }
  });



  Meteor.startup(function () {
    /*
      if (Lists.find().count() === 0) {
        console.log("Trying to insert new Lists");
        //var global_list = Lists.insert({_id:null});
        var family_list_id  = Lists.insert({list_name:"Family", owner:this.userId});
        var friends_list_id = Lists.insert({list_name:"Friends",owner:this.userId});
      }
      if (Contacts.find().count() === 0) {
        console.log("Trying to insert new Contacts");
        var contacts = 
        		[
              {name: "My Brother",
               addresses: [{street:"79 Brighton 11th St"},{street:"201 Brighton 1st Rd"}], 
               phones   : [{number:"718-648-1769"}],  
               lists    : [{list_id: family_list_id}],
              },
              {name: "Me",        
               addresses: [{street:"201 Brighton 1st Rd"},{street:"79 Brighton 1th St"}], 
               lists    : [{list_id: family_list_id}]  
              },
              {name: "My Father", 
               addresses: [{street:"201 Brighton 1st Rd"},{street:"79 Brighton 1th St"}], 
               lists    : [{list_id: family_list_id}]  
              },       
              {name: "My Mother", 
               addresses: [{street:"79 Brighton 11th St"}], 
               lists    : [{list_id: family_list_id}]  
              },
              {name: "Max Godko", 
               addresses: [{street:"Avenue U"}], 
               lists    : [{list_id: friends_list_id}, {list_id:family_list_id}]  
              }
            ];
        for (var i = 0; i < contacts.length; i++) {
          Contacts.insert(contacts[i]);
        }      
      }
    */
  });
//}