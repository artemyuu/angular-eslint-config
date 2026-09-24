const { componentMetadataOrder, importOrder } = require('./component-metadata-order');
const angularMemberOrder = require('./angular-member-order');
const angularInputOutput = require('./angular-input-output');
const ngxsSelector = require('./ngxs-selector');
const subjectConvention = require('./subject-convention');
const pageSeo = require('./page-seo');

module.exports = {
  rules: {
    'component-metadata-order': componentMetadataOrder,
    'import-order': importOrder,
    'angular-member-order': angularMemberOrder,
    'angular-input-output': angularInputOutput,
    'ngxs-selector': ngxsSelector,
    'subject-convention': subjectConvention,
    'page-seo': pageSeo,
  },
};
