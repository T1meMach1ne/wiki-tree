import * as http from 'http';
import * as fs from 'fs/promises';
import { DevServer } from '../types';
import { IndexLoadError, PortConflictError } from './errors';
import { pathExists } from '../utils/fileSystem';

export class WikiSiteServer {
  async startServer(indexPath: string, port = 3210): Promise<DevServer> {
    const exists = await pathExists(indexPath);
    if (!exists) {
      throw new IndexLoadError('索引文件不存在: ' + indexPath);
    }
    const indexContent = await fs.readFile(indexPath, 'utf-8');

    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      const html = this.renderHtml(indexContent, indexPath);
      res.end(html, 'utf-8');
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', (error) => {
        if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
          reject(new PortConflictError('端口已被占用: ' + port, port));
          return;
        }
        reject(error);
      });
      server.listen(port, resolve);
    });

    return {
      port,
      url: 'http://localhost:' + port,
      close: () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }),
    };
  }

  private renderHtml(indexContent: string, indexPath: string): string {
    const escaped = indexContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const parts: string[] = [];
    parts.push('<!DOCTYPE html>');
    parts.push('<html lang="zh-CN">');
    parts.push('<head>');
    parts.push('<meta charset="UTF-8" />');
    parts.push('<title>Wiki Tree</title>');
    parts.push(
      '<style>body{font-family:Segoe UI,Arial,sans-serif;margin:32px;}pre{background:#f5f5f5;padding:16px;border-radius:8px;}</style>'
    );
    parts.push('</head>');
    parts.push('<body>');
    parts.push('<h1>Wiki Tree 索引</h1>');
    parts.push('<p>索引文件路径: ' + indexPath + '</p>');
    parts.push('<pre>' + escaped + '</pre>');
    parts.push('</body>');
    parts.push('</html>');
    return parts.join('');
  }
}

export default WikiSiteServer;
