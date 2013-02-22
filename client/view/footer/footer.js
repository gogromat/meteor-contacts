Template.footer.total_users = function () {
  var total = 0;
  if (Counts.findOne() !== undefined) {
    total = parseInt(Counts.findOne().counts);
  }
  return "There are currently " + total + " registered users who are using Meteor Contacts";
}