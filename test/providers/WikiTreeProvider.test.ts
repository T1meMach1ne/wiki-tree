jest.mock('vscode', () => require('../../__mocks__/vscode'), { virtual: true });

import { WikiTreeProvider } from '../../src/providers/WikiTreeProvider';
import { WikiIndex, WikiNode } from '../../src/types';

const index: WikiIndex = {
  version: '0.1.0',
  generatedAt: new Date().toISOString(),
  root: '/workspace',
  nodes: [
    {
      id: 'docs',
      title: 'docs',
      path: '/workspace/docs',
      type: 'folder',
      children: [
        {
          id: 'docs/guide.md',
          title: 'guide.md',
          path: '/workspace/docs/guide.md',
          type: 'file',
          summary: '指南',
        },
      ],
    },
  ],
};

describe('WikiTreeProvider', () => {
  it('返回顶层节点', () => {
    const provider = new WikiTreeProvider(index);
    const children = provider.getChildren() as WikiNode[];
    expect(children).toHaveLength(1);
    expect(children[0].title).toBe('docs');
  });

  it('返回子节点', () => {
    const provider = new WikiTreeProvider(index);
    const rootNode = index.nodes[0];
    const children = provider.getChildren(rootNode) as WikiNode[];
    expect(children).toHaveLength(1);
    expect(children[0].title).toBe('guide.md');
  });
});
