const { getMemberName } = require('./utils');

const pageMetadata = ['title', 'header', 'description', 'ogDescription', 'content', 'keywords', 'cssModules'];

module.exports = {
  meta: { type: 'layout', docs: { description: 'Keep SEO properties in the required order on pages.' }, schema: [] },
  create(context) {
    const isPageFile = context.filename.split(/[\\/]/).includes('pages');
    return {
      ClassBody(node) {
        if (!isPageFile) return;
        let previousIndex = -1;
        for (const member of node.body) {
          const name = getMemberName(member);
          const index = pageMetadata.indexOf(name);
          if (index === -1) continue;
          if (index < previousIndex) context.report({ node: member, message: 'Page SEO properties must be ordered: title, header, description, ogDescription, content, keywords, cssModules.' });
          previousIndex = Math.max(previousIndex, index);
        }
      },
    };
  },
};
