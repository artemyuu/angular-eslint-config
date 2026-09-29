// eslint/rules/angular-input-naming.js

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Angular input signals',
    },
    schema: [],
    messages: {
      mustBeReadonly: 'Angular input must be readonly.',
      mustHaveDollarPrefix:
        'Angular input must have a "$" prefix.',
      invalidAlias:
        'Angular input alias must match the property name without "$".',
    },
  },

  create(context) {
    return {
      PropertyDefinition(node) {
        const value = node.value;

        if (
          !value ||
          value.type !== 'CallExpression' ||
          value.callee.type !== 'Identifier' ||
          value.callee.name !== 'input'
        ) {
          return;
        }

        const propertyName =
          node.key.type === 'Identifier'
            ? node.key.name
            : null;

        if (!propertyName) {
          return;
        }

        // 1. readonly
        const isReadonly = node.accessibility === undefined
          ? node.readonly === true
          : node.readonly === true;

        if (!isReadonly) {
          context.report({
            node,
            messageId: 'mustBeReadonly',
          });
        }

        // 2. $
        if (!propertyName.startsWith('$')) {
          context.report({
            node,
            messageId: 'mustHaveDollarPrefix',
          });
        }

        // 3. alias
        const expectedAlias = propertyName.slice(1);

        const options = value.arguments[1];

        if (
          options?.type !== 'ObjectExpression'
        ) {
          return;
        }

        const aliasProperty = options.properties.find(
          (property) =>
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === 'alias'
        );

        if (!aliasProperty) {
          return;
        }

        if (
          aliasProperty.value.type !== 'Literal' ||
          aliasProperty.value.value !== expectedAlias
        ) {
          context.report({
            node: aliasProperty,
            messageId: 'invalidAlias',
          });
        }
      },
    };
  },
};
