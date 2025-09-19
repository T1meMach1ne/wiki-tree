import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import WikiTreeGenerator from '../../src/core/WikiTreeGenerator';
import { ScanConfig, WikiIndex } from '../../src/types';

async function createTempWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-tree-'));
  await fs.mkdir(path.join(base, 'docs'));
  await fs.writeFile(path.join(base, 'README.md'), '# 主文档\n\n这是一个测试文档', 'utf-8');
  await fs.writeFile(path.join(base, 'docs', 'Guide.md'), '# 指南\n\n内容', 'utf-8');
  await fs.writeFile(path.join(base, 'notes.txt'), '临时笔记', 'utf-8');
  return base;
}

describe('WikiTreeGenerator', () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await createTempWorkspace();
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  it('生成索引并写入 index.json', async () => {
    const generator = new WikiTreeGenerator();
    const config: ScanConfig = {
      fileTypes: ['md', 'txt'],
      excludeFolders: ['node_modules', '.git'],
      includeCodeComments: false,
      maxDepth: 5,
      maxFileSizeKB: 512,
      outputDir: '.wiki-tree',
    };

    const result = await generator.generateIndex(workspace, config);
    expect(result.generatedNodes).toBeGreaterThanOrEqual(2);

    const indexPath = path.join(workspace, config.outputDir, 'index.json');
    const indexRaw = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexRaw) as WikiIndex;
    expect(index.nodes.length).toBeGreaterThan(0);
    const titles = index.nodes.map((node) => node.title);
    expect(titles).toContain('README.md');
  });
});
