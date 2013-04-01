/* FILTERS BY LISTS */
Template.lists_filter.helpers({
  list_name: function () {
    return this.list_name || (!Meteor.userId() ? "Public Contacts" : "All My Contacts");
  },
  selected: function () {
    var id = null;
    if (this._id) {
      id = this._id;
    }
    return Session.equals('selected_list_id', id) ? 'list_selected' : 'list_unselected';
  }
});


Template.lists_filter.lists = function() {
  var lists = [];

  Lists.find({}).forEach(function(list) {
    lists.push(list);
  });

  lists.unshift({list_name: null});
  return lists;
  //todo: add count
}

Template.lists_filter.events({
  'mousedown .lists_filter' : function() {//evt, tmpl
    var id = null;
    if (this._id) {
      id = this._id;
    }
    Session.set('address_filter',  null);
    Session.set('phone_filter',    null);
    Session.set('search_contacts', null);
    $('#search_contacts').val("");
    // make sure blur occurs
    Meteor.setTimeout(function() {
      Session.set('selected_list_id', id);
    },50);
    Meteor.flush();
  },
  'mouseover .lists_filter, mouseover #new_list_name' : function (e) {
    if (!Meteor.user()) {
      var div_filter  = $(e.currentTarget),
          div_position = div_filter.offset(),
          top     = div_position.top,
          left    = div_position.left,
          width   = div_filter.width(),
          xOffset = 20;

      $("#list_filter_suggestion")
        .css("top", (top) + "px")
        .css("left",(left + width + xOffset) + "px")
        .show(100);
    }
  },
  'mouseout .lists_filter, mouseout #new_list_name': function () {
    if (!Meteor.user()) {
      $("#list_filter_suggestion").hide(250);
    }
  },
  'click .add_list, blur #new_list_name, keydown #new_list_name' : function(evt) {
    if (evt.which === undefined || evt.which === 13) {
      var new_list = $('#new_list_name'),
          new_list_name = new_list.val().trim();

      if (new_list_name !== "") {
        Meteor.call("add_list", new_list_name, function (error, result) {
          Session.set("selected_list_id", result);
        });        
        new_list.val("");
      }
    }
  },
  'blur .list_selected' : function (evt) {
    var id = this._id,
        old_name = this.list_name,
        new_name = evt.target.value.trim();
    if (new_name && id && old_name !== new_name) {
        Meteor.call("change_list_name", id, new_name);
    }
  },
  'click .remove_list' : function() {
    var list_id = this._id;
    Contacts.find({"lists":{"list_id": list_id}}).forEach(function(contact) {
      if (_.size(contact.lists) > 1) {
        // Contact on multiple lists
        Meteor.call("remove_list_from_contacts",list_id);
      } else {
        Meteor.call("remove_contact",contact._id);
      }
    });
    Meteor.call("remove_list", list_id);
  }
});