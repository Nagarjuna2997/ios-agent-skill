#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { createKnowledgeServer } from './knowledge.js';
import type { Request, Response } from 'express';
import { VERSION } from './version.js';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('ios-agent-knowledge [--http] [--port 3000] [--host 127.0.0.1]\nDefault: MCP over stdio. HTTP: public-reference tools only at /mcp, health at /health. No project filesystem access.');
} else if (args.includes('--version')) {
  console.log(VERSION);
} else if (!args.includes('--http')) {
  await createKnowledgeServer().connect(new StdioServerTransport());
} else {
  const value = (flag:string, fallback:string) => args.includes(flag) ? args[args.indexOf(flag)+1] : fallback;
  const port = Number(value('--port', process.env.PORT || '3000'));
  const host = value('--host','127.0.0.1');
  if (!Number.isInteger(port) || port < 0 || port > 65535 || !host || host.startsWith('--')) throw new Error('Invalid host/port');
  const app = createMcpExpressApp({ host });
  app.get('/health', (_req:Request,res:Response) => { res.json({status:'ok',version:VERSION,mode:'public-reference-only'}); });
  app.post('/mcp', async (req:Request,res:Response) => {
    const server = createKnowledgeServer();
    const transport = new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
    res.on('close', () => { void transport.close(); void server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req,res,req.body);
    } catch {
      if (!res.headersSent) res.status(500).json({jsonrpc:'2.0',id:null,error:{code:-32603,message:'MCP request failed'}});
    }
  });
  app.get('/mcp', (_req:Request,res:Response) => {res.status(405).end();});
  app.delete('/mcp', (_req:Request,res:Response) => {res.status(405).end();});
  const listener=app.listen(port,host,()=>{ const address=listener.address();console.error(`ios-agent-knowledge HTTP listening on ${typeof address==='object' && address ? address.port : port}`); });
  process.on('SIGTERM',()=>listener.close());
  process.on('SIGINT',()=>listener.close());
}
