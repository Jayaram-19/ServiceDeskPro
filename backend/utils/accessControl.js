const isPrivileged = (role) => ['admin', 'manager'].includes(role);

const ownsTicket = (ticket, user) => {
  if (isPrivileged(user.role)) return true;
  if (user.role === 'technician') return ticket.assignedTo?.toString() === user._id.toString();
  return ticket.requester.toString() === user._id.toString();
};

const ticketScope = (user) => {
  const scope = { organization: user.organization };
  if (user.role === 'technician') scope.assignedTo = user._id;
  else if (!isPrivileged(user.role)) scope.requester = user._id;
  return scope;
};

const assetScope = (user) => {
  const scope = { organization: user.organization };
  if (!['admin', 'manager', 'asset_manager'].includes(user.role)) scope.assignedTo = user._id;
  return scope;
};

module.exports = { isPrivileged, ownsTicket, ticketScope, assetScope };
