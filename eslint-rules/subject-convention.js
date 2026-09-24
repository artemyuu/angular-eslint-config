const { getMemberName } = require('./utils');

module.exports = {
  meta: { type: 'style', docs: { description: 'Enforce Subject naming conventions.' }, schema: [] },
  create(context) {
    return {
      PropertyDefinition(node) {
        const name = getMemberName(node) ?? '';
        const initializer = node.value;
        const isSubject = initializer?.type === 'NewExpression' && ['Subject', 'BehaviorSubject'].includes(initializer.callee?.name);
        if (isSubject && (!node.readonly || !name.endsWith('$$'))) context.report({ node, message: 'Subject properties must be readonly and end with "$$".' });
      },
    };
  },
};
