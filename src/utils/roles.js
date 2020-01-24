const getRoles = async (arId, userLoader) => {
  const user = await userLoader.load(arId);
  if (user) return user.roles || [];
  return [];
};

const canViewUsers = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('usrHead') ||
    roles.includes('usrAdm') ||
    roles.includes('head') ||
    roles.includes('admin') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canEditUsers = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('usrAdm') || roles.includes('admin') || roles.includes('root')) return true;
  return false;
};

const canViewSomeEvents = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('evtHead')) return true;
  return false;
};

const canViewAllEvents = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('evtAdm') ||
    roles.includes('head') ||
    roles.includes('admin') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canViewEvents = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('evtHead') ||
    roles.includes('evtAdm') ||
    roles.includes('head') ||
    roles.includes('admin') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canEditEvents = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('evtAdm') || roles.includes('admin') || roles.includes('root')) return true;
  return false;
};

const canViewPronites = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('proHead') ||
    roles.includes('proAdm') ||
    roles.includes('payHead') ||
    roles.includes('payAdm') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canEditPronites = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('proAdm') || roles.includes('payAdm') || roles.includes('root')) return true;
  return false;
};

const canViewAcc = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('accHead') ||
    roles.includes('accAdm') ||
    roles.includes('payHead') ||
    roles.includes('payAdm') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canEditAcc = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('accAdm') || roles.includes('payAdm') || roles.includes('root')) return true;
  return false;
};

const canViewOrders = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (
    roles.includes('orderHead') ||
    roles.includes('orderAdm') ||
    roles.includes('payHead') ||
    roles.includes('payAdm') ||
    roles.includes('root')
  )
    return true;
  return false;
};

const canEditOrders = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('orderAdm') || roles.includes('payAdm') || roles.includes('root')) return true;
  return false;
};

const canViewCA = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('caHead') || roles.includes('caAdm') || roles.includes('root')) return true;
  return false;
};

const canEditCA = async (arId, userLoader) => {
  const roles = await getRoles(arId, userLoader);
  if (roles.includes('caAdm') || roles.includes('root')) return true;
  return false;
};

module.exports = {
  getRoles,
  canViewUsers,
  canEditUsers,
  canViewEvents,
  canViewSomeEvents,
  canViewAllEvents,
  canEditEvents,
  canViewPronites,
  canEditPronites,
  canViewAcc,
  canEditAcc,
  canViewOrders,
  canEditOrders,
  canViewCA,
  canEditCA,
};
