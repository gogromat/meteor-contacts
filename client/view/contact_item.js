// This are the transformation functions that take our
// array of addresses / phones for a person and returning a new object 
// that containt an id of the contact in it as well for further manipulation
Template.contact_item.helpers({
  address_objs: function () {
    var contact_id = this._id;
    return _.map(this.addresses || [], function (address) {
      return {contact_id : contact_id, street : address.street};
    });
  },
  phones_objs: function () {
    var contact_id = this._id;
    return _.map(this.phones || [], function (phone) {
      return {contact_id : contact_id, number : phone.number};
    });
  },
  email_objs: function () {
    var contact_id = this._id;
    return _.map(this.emails || [], function (email) {
      return {contact_id : contact_id, 
              address: email.address,
              gravatar: Gravatar.imageUrl(email.address)
             };
    });
  },
  contacts_view_type: function () {
    return Session.get('contacts_view_type') === 'list' ? '' : 'contacts_view_type';
  }
});


Template.contact_item.events({
    'click .remove_contact': function() {
      Meteor.call("remove_contact",this._id);
    },
    'click .add_another_address, blur .add_another_address_input, keydown .add_another_address_input': function(evt) {
      if (evt.which === undefined || evt.which === 1 || evt.which === 13) {
        var id = this._id,
            new_address = $("#" + this._id + '_add_address'),
            new_street  = new_address.val().trim();
        if (new_street === "") {
          return false;
        }
        var isAddressSet = Contacts.findOne({_id: id, "addresses": {"street":new_street}});
        if (!isAddressSet) {
          Meteor.call("change_address",id,new_street,'add');
        }
        new_address.val("");
      }
    },
    'click .remove_address': function() {
      var id  = this.contact_id,
          street = this.street;
      Meteor.call("change_address",id,street,'remove');
    },
    'click .add_another_phone, blur .add_another_phone_input, keydown .add_another_phone_input': function (evt) {
      if (evt.which === undefined || evt.which === 1 || evt.which === 13) {
        var id = this._id,
            new_phone = $("#" + this._id + '_add_phone'),
            new_number = new_phone.val().trim();
        if (new_number === "") {
          return false;
        }
        var isPhoneSet = Contacts.findOne({_id: id, "phones": {"number":new_number}});
        if (!isPhoneSet) {
          Meteor.call("change_phone", id, new_number,'add');
        }
        new_phone.val("");
      }
    },
    'click .remove_phone': function() {
      var id     = this.contact_id,
          number = this.number;
      Meteor.call("change_phone", id, number, 'remove');
    },
    'click .add_another_email, blur .add_another_email_input, keydown .add_another_email_input': function (evt) {
      if (evt.which === undefined || evt.which === 1 || evt.which === 13) {
        var id = this._id,
            new_email = $("#" + this._id + '_add_email'),
            new_address = new_email.val().trim();
        if (new_address === "") {
          return false;
        }
        var isEmailSet = Contacts.findOne({_id: id, "emails": {"address": new_address }});
        if (!isEmailSet) {
          Meteor.call("change_email", id, new_address,'add');
        }
        new_email.val("");
      }
    },
    'click .remove_email': function() {
      var id      = this.contact_id,
          address = this.address;
      Meteor.call("change_email", id, address, 'remove');
    },

    'blur .contact_name, keydown .contact_name': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id  = this._id,
            old_name = this.name,
            new_name = evt.target.value.trim();
        if (old_name !== new_name) {
          if (new_name !== "") {
            Meteor.call("change_name",id,new_name,"change")
          } else {
            Meteor.call("remove_contact", id);
          }
        }
      }
    },
    'blur .contact_address, keydown .contact_address': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this.contact_id,
            old_street = this.street,
            new_street = evt.target.value.trim();
        if (old_street !== new_street) {
          var isAddressSet = Contacts.findOne({_id: id, "addresses": {"street":new_street}});
          if (!isAddressSet) {
            Meteor.call("change_address",id, old_street, 'remove');
            if (new_street !== "") {
              Meteor.call("change_address",id, new_street, 'add');
            }
            Session.set('address_filter', null);
          } else {
            evt.target.value = old_street;
          }
        }
      }
    },
    'blur .contact_phone, keydown .contact_phone': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this.contact_id,
            old_number = this.number,
            new_number = evt.target.value.trim();
        if (old_number !== new_number) {
          var isPhoneSet = Contacts.findOne({_id: id, "phones": {"number":new_number}});
          if (!isPhoneSet) {          
            Meteor.call("change_phone",id, old_number, 'remove');
            if (new_number !== "") {
              Meteor.call("change_phone",id, new_number, 'add');
            }
            Session.set('phone_filter', null);
          } else {
            evt.target.value = old_number;
          }
        }
      }
    },
    'blur .contact_email, keydown .contact_email': function(evt) {
      if (evt.which === undefined || evt.which === 13) {
        var id = this.contact_id,
            old_address = this.address,
            new_address = evt.target.value.trim();
        if (old_address !== new_address) {
          var isEmailSet = Contacts.findOne({_id: id, "emails": {"address": new_address }});
          if (!isEmailSet) {
            Meteor.call("change_email",id, old_address, 'remove');
            if (new_address !== "") {
              Meteor.call("change_email",id, new_address, 'add');
            }
            Session.set('phone_filter', null);
          } else {
            evt.target.value = old_address;
          }          
        }
      }
    }
});