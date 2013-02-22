// Banner for users who are not logged in
Template.not_logged_in_sub_header.logged_in = function () {
  if (Meteor.userId()) {
    return true;
  } 
  return false;
}