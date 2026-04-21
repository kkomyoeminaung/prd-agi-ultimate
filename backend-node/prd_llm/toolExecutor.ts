import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

export class ToolExecutor {
  async executeCalculator(expression: string): Promise<string> {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '').trim();
      if (!sanitized) return 'Invalid expression';
      
      // Safe math evaluation without eval()
      const calculate = (expr: string): number => {
        const tokens = expr.match(/(\d+\.?\d*|[+\-*/()])/g) || [];
        // Simple recursive descent parser
        let pos = 0;
        const num = (): number => {
          const tok = tokens[pos++];
          if (!tok) return 0;
          if (tok === '(') { const v = add(); pos++; return v; }
          return parseFloat(tok);
        };
        const mul = (): number => { let v = num(); while (tokens[pos] === '*' || tokens[pos] === '/') { const op = tokens[pos++]; v = op === '*' ? v * num() : v / num(); } return v; };
        const add = (): number => { let v = mul(); while (tokens[pos] === '+' || tokens[pos] === '-') { const op = tokens[pos++]; v = op === '+' ? v + mul() : v - mul(); } return v; };
        return add();
      };
      
      const result = calculate(sanitized);
      return `Calculator result: ${result}`;
    } catch (e) {
      return `Calculator error: invalid expression`;
    }
  }

  async executeWebSearch(query: string): Promise<string> {
    try {
      // Simulate web search using DuckDuckGo HTML or API (stubbed for Colab env)
      return `Search results for "${query}": Found various relevant documents.`;
    } catch (e) {
      return `Search failed`;
    }
  }

  async executeCode(code: string): Promise<string> {
    const tmpFile = path.join('/tmp', `exec_${Date.now()}.py`);
    try {
      fs.writeFileSync(tmpFile, code);
      const { stdout, stderr } = await execPromise(`python3 ${tmpFile}`, { timeout: 5000 });
      return `Code Output:\n${stdout}\nErrors:\n${stderr}`;
    } catch (e: any) {
      return `Code Execution Error: ${e.message}`;
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }

  async executeQuery(sql: string, db: any): Promise<string> {
    try {
      const results = await db.all(sql);
      return `Query returned ${results.length} rows: ${JSON.stringify(results).slice(0, 200)}...`;
    } catch (e: any) {
      return `DB Query Error: ${e.message}`;
    }
  }

  async executeTool(toolName: string, args: any, db: any): Promise<string> {
    switch (toolName) {
      case 'calculator': return this.executeCalculator(args.expression);
      case 'search': return this.executeWebSearch(args.query);
      case 'code': return this.executeCode(args.code);
      case 'database': return this.executeQuery(args.sql, db);
      default: return `Unknown tool: ${toolName}`;
    }
  }
}

export const toolExecutor = new ToolExecutor();
