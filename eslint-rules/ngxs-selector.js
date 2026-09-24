const { getMemberName } = require('./utils');

module.exports = {
  meta: { type: 'style', docs: { description: 'Enforce NGXS selector naming conventions.' }, schema: [] },
  create(context) {
    return {
      PropertyDefinition(node) {
        const name = getMemberName(node) ?? '';
        const initializer = node.value;
        const isSelector = initializer?.type === 'CallExpression' && initializer.callee?.type === 'MemberExpression' && initializer.callee.property?.name === 'select';
        if (isSelector && (!node.readonly || !name.endsWith('$'))) context.report({ node, message: 'Store selectors must be readonly and end with "$".' });
      },
    };
  },
};
