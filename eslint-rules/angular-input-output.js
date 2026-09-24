const { getDecoratorName, getMemberName } = require('./utils');

const signalFactories = new Set([
  'signal',
  'computed',
  'input',
  'output',
  'model',
  'viewChild',
  'viewChildren',
  'contentChild',
  'contentChildren',
]);

function getFactoryName(callee) {
  if (callee?.type === 'Identifier') return callee.name;
  if (callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier') return callee.object.name;
  return undefined;
}

module.exports = {
  meta: { type: 'style', docs: { description: 'Enforce Angular input, output, and signal naming conventions.' }, schema: [] },
  create(context) {
    return {
      PropertyDefinition(node) {
        const decorators = node.decorators ?? [];
        const name = getMemberName(node) ?? '';
        const factoryName = getFactoryName(node.value?.callee);
        const isSignal = signalFactories.has(factoryName);
        if (!isSignal) return;

        if (!name.startsWith('$')) context.report({ node, message: 'Angular signals must start with "$".' });
        if (!node.readonly) context.report({ node, message: 'Angular signal fields must be readonly.' });

        if (factoryName === 'input') {
          const options = node.value.arguments?.[0];
          const alias = options?.type === 'ObjectExpression' && options.properties.find((property) => property.type === 'Property' && property.key.type === 'Identifier' && property.key.name === 'alias');
          const expectedAlias = name.startsWith('$') ? name.slice(1) : name;
          if (alias?.value?.type !== 'Literal' || alias.value.value !== expectedAlias) {
            context.report({ node, message: 'Inputs must have an alias matching the name without "$".' });
          }
        }

        const output = decorators.some((decorator) => getDecoratorName(decorator) === 'Output') || factoryName === 'output';
        if (!output) return;
        const hasDescription = node.leadingComments?.some((comment) => comment.type === 'Block' && comment.value.trim().startsWith('*'));
        if (!name.startsWith('$on') || !hasDescription) context.report({ node, message: 'Events must have a description and start with the "$on" prefix.' });
      },
    };
  },
};
