// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "contacts".

Lists    = new Meteor.Collection("lists");
Contacts = new Meteor.Collection("contacts");

// On server startup, create some contacts if the database is empty.
//if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Lists.find().count() === 0) {
      var family_list_id  = Lists.insert({"list_name":"Friends"});
      var friends_list_id = Lists.insert({"list_name":"Friends"});
    }
    if (Contacts.find().count() === 0) {
      var contacts = 
      		[
            {"name": "My Brother",
             "addresses": [{"street":"79 Brighton 11th St"},{"street":"201 Brighton 1st Rd"}], 
             "phones"   : [{"number":"718-648-1769"}],  
             "lists"    : [{"list_id": family_list_id}],
            },
            {"name": "Me",        
             "addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },
            {"name": "My Father", 
             "addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },       
            {"name": "My Mother", 
             "addresses": [{"street":"79 Brighton 11th St"}], 
             "lists"    : [{"list_id": family_list_id}]  
            },
            {"name": "Max Godko", 
             "addresses": [{"street":"Avenue U"}], 
             "lists"    : [{"list_id": friends_list_id}, {"list_id":family_list_id}]  
            }
          ];
      for (var i = 0; i < contacts.length; i++) {
        Contacts.insert(contacts[i]);
      }
      //Contacts.insert({"name": "Max Godko","addresses": [{"street":"201 Brighton 1st Rd"},{"street":"79 Brighton 1th St"}],"lists":[{"list_id": 1}]});
    }
  });
//}