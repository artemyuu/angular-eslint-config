const {
  projectGroups,
  getProjectGroup,
  getDecoratorName,
  getPropertyName,
  checkOrderedNodes,
} = require('./utils');

const metadataOrder = ['selector', 'template', 'styles', 'changeDetection', 'imports'];

const metadataAliases = {
  templateUrl: 'template',
  stylesUrl: 'styles',
};

const metadataOrderIndex = (property) => {
  const propertyName = getPropertyName(property);
  return metadataOrder.indexOf(metadataAliases[propertyName] ?? propertyName);
};

const importOrder = {
  meta: { type: 'layout', docs: { description: 'Keep imports in the prescribed project group order.' }, schema: [] },
  create(context) {
    let previousGroup = -1;
    return {
      ImportDeclaration(node) {
        const group = getProjectGroup(node.source.value);
        if (group < previousGroup) {
          context.report({ node, message: 'Imports must be ordered: Angular, @{{ PROJECT_NAME }}, @core, @pages, @shared, @modules, then local.' });
        }
        previousGroup = Math.max(previousGroup, group);
      },
    };
  },
};

const componentMetadataOrder = {
  meta: { type: 'layout', docs: { description: 'Keep Component metadata and its imports in project order.' }, schema: [] },
  create(context) {
    const sourceGroups = new Map();
    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) sourceGroups.set(specifier.local.name, getProjectGroup(node.source.value));
      },
      Decorator(node) {
        if (getDecoratorName(node) !== 'Component') return;
        const argument = node.expression.arguments?.[0];
        if (argument?.type !== 'ObjectExpression') return;
        checkOrderedNodes(
          context,
          argument.properties.filter((property) => property.type === 'Property'),
          (property) => {
            const index = metadataOrderIndex(property);
            return index === -1 ? metadataOrder.length : index;
          },
          'Component metadata must be ordered: selector, template or templateUrl, styles or stylesUrl, changeDetection, imports.',
        );
        const imports = argument.properties.find((property) => getPropertyName(property) === 'imports');
        checkOrderedNodes(
          context,
          imports?.value?.elements?.filter(Boolean) ?? [],
          (element) => sourceGroups.get(element.name) ?? projectGroups.length,
          'Component imports must follow the project dependency group order.',
        );
      },
    };
  },
};

module.exports = { componentMetadataOrder, importOrder };
