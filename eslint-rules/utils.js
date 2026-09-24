const projectGroups = [
  /^@angular\//,
  /^@{{ PROJECT_NAME }}\//,
  /^(?:@core|@app\/core)(?:\/|$)/,
  /^@pages(?:\/|$)/,
  /^@shared(?:\/|$)/,
  /^@modules(?:\/|$)/,
  /^\./,
];

function getProjectGroup(source) {
  const group = projectGroups.findIndex((pattern) => pattern.test(source));
  return group === -1 ? projectGroups.length : group;
}

function getPropertyName(property) {
  return property.key?.name ?? property.key?.value;
}

function getDecoratorName(decorator) {
  const expression = decorator.expression;
  const callee = expression?.callee ?? expression;
  return callee?.name;
}

function getMemberName(member) {
  return member.key?.name ?? member.key?.value;
}

function checkOrderedNodes(context, nodes, getGroup, message) {
  let previousGroup = -1;
  for (const node of nodes) {
    const group = getGroup(node);
    if (group < previousGroup) context.report({ node, message });
    previousGroup = Math.max(previousGroup, group);
  }
}

module.exports = {
  projectGroups,
  getProjectGroup,
  getPropertyName,
  getDecoratorName,
  getMemberName,
  checkOrderedNodes,
};
