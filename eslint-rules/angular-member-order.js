const { getDecoratorName, getMemberName } = require('./utils');

const pageMetadata = ['title', 'header', 'description', 'ogDescription', 'content', 'keywords', 'cssModules'];

module.exports = {
  meta: { type: 'layout', docs: { description: 'Keep Angular class members in the prescribed order.' }, schema: [] },
  create(context) {
    const isPageFile = context.filename.split(/[\\/]/).includes('pages');

    function getMemberGroup(member) {
      const decoratorNames = (member.decorators ?? []).map(getDecoratorName);
      const name = getMemberName(member) ?? '';
      const initializerName = member.value?.callee?.name;
      const isConstructor = member.type === 'MethodDefinition' && name === 'constructor';
      const isLifecycle = /^ng(?:OnChanges|OnInit|DoCheck|AfterContentInit|AfterContentChecked|AfterViewInit|AfterViewChecked|OnDestroy)$/.test(name);
      const isGetterOrSetter = member.type === 'MethodDefinition' && ['get', 'set'].includes(member.kind);
      const isPrivateMethod = member.type === 'MethodDefinition' && member.accessibility === 'private';
      if (isPageFile && member.type === 'PropertyDefinition' && pageMetadata.includes(name)) return pageMetadata.indexOf(name) + 1;
      if (member.type === 'PropertyDefinition' && (decoratorNames.some((decorator) => ['Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostListener', 'HostBinding'].includes(decorator)) || ['input', 'output', 'viewChild', 'viewChildren', 'contentChild', 'contentChildren'].includes(initializerName))) return 8;
      if (member.type === 'PropertyDefinition' && name.endsWith('$')) return 9;
      if (member.type === 'PropertyDefinition' && member.accessibility !== 'private' && !member.readonly) return 10;
      if (member.type === 'PropertyDefinition' && member.accessibility !== 'private' && member.readonly) return 11;
      if (member.type === 'PropertyDefinition' && member.accessibility === 'private' && !member.readonly) return 12;
      if (member.type === 'PropertyDefinition' && member.accessibility === 'private' && member.readonly) return 13;
      if (isGetterOrSetter) return 14;
      if (isConstructor) return 15;
      if (isLifecycle) return 16;
      if (isPrivateMethod) return 19;
      if (member.type === 'MethodDefinition') return 18;
      return 17;
    }

    return {
      ClassBody(node) {
        let previousGroup = -1;
        for (const member of node.body) {
          const group = getMemberGroup(member);
          if (group < previousGroup) context.report({ node: member, message: 'Class members are out of the required order.' });
          previousGroup = Math.max(previousGroup, group);
        }
      },
    };
  },
};
