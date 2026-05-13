export interface LuaValue {
  type: 'nil' | 'number' | 'string' | 'boolean' | 'function' | 'table' | 'userdata';
  value: any;
}

export interface LuaTable {
  array: LuaValue[];
  dict: Map<string, LuaValue>;
}

export interface LuaFunction {
  params: string[];
  body: LuaASTNode[];
  closure: Map<string, LuaValue>;
}

export type LuaASTNode = 
  | { type: 'assignment'; names: string[]; exprs: LuaASTNode[] }
  | { type: 'binaryOp'; op: string; left: LuaASTNode; right: LuaASTNode }
  | { type: 'unaryOp'; op: string; operand: LuaASTNode }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'nil' }
  | { type: 'identifier'; name: string }
  | { type: 'tableConstructor'; fields: { key?: LuaASTNode; value: LuaASTNode }[] }
  | { type: 'indexAccess'; base: LuaASTNode; index: LuaASTNode }
  | { type: 'functionCall'; name: string; args: LuaASTNode[] }
  | { type: 'functionDef'; name?: string; params: string[]; body: LuaASTNode[] }
  | { type: 'if'; condition: LuaASTNode; thenBody: LuaASTNode[]; elseIfs: { condition: LuaASTNode; body: LuaASTNode[] }[]; elseBody?: LuaASTNode[] }
  | { type: 'while'; condition: LuaASTNode; body: LuaASTNode[] }
  | { type: 'for'; variable: string; start: LuaASTNode; end: LuaASTNode; step?: LuaASTNode; body: LuaASTNode[] }
  | { type: 'return'; value?: LuaASTNode }
  | { type: 'break' }
  | { type: 'call'; expr: LuaASTNode; args: LuaASTNode[] };

export interface LuaPlugin {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}

export interface LuaExecutionResult {
  success: boolean;
  returnValue?: LuaValue;
  error?: string;
  output?: string[];
}

export class LuaInterpreter {
  private globals: Map<string, LuaValue> = new Map();
  private output: string[] = [];
  private currentFunction: LuaFunction | null = null;
  private localScopes: Map<string, LuaValue>[] = [];
  private breakRequested = false;
  private returnRequested: LuaValue | null = null;

  constructor() {
    this.setupBuiltins();
  }

  private setupBuiltins(): void {
    this.globals.set('print', {
      type: 'function',
      value: (args: LuaValue[]) => {
        const output = args.map(arg => this.stringify(arg)).join('\t');
        this.output.push(output);
        return { type: 'nil', value: null };
      }
    });

    this.globals.set('type', {
      type: 'function',
      value: (args: LuaValue[]) => {
        if (args.length === 0) return { type: 'string', value: 'nil' };
        return { type: 'string', value: args[0].type };
      }
    });

    this.globals.set('pairs', {
      type: 'function',
      value: (args: LuaValue[]) => {
        if (args.length === 0 || args[0].type !== 'table') {
          return { type: 'function', value: () => ({ type: 'nil', value: null }) };
        }
        const table = args[0].value as LuaTable;
        const keys = Array.from(table.dict.keys());
        let index = 0;
        return {
          type: 'function',
          value: () => {
            if (index < keys.length) {
              const key = keys[index++];
              return [
                { type: 'string', value: key },
                table.dict.get(key)!
              ];
            }
            return { type: 'nil', value: null };
          }
        };
      }
    });

    this.globals.set('ipairs', {
      type: 'function',
      value: (args: LuaValue[]) => {
        if (args.length === 0 || args[0].type !== 'table') {
          return { type: 'function', value: () => ({ type: 'nil', value: null }) };
        }
        const table = args[0].value as LuaTable;
        let index = 0;
        return {
          type: 'function',
          value: () => {
            index++;
            if (index <= table.array.length) {
              return [
                { type: 'number', value: index },
                table.array[index - 1]
              ];
            }
            return { type: 'nil', value: null };
          }
        };
      }
    });

    this.globals.set('tonumber', {
      type: 'function',
      value: (args: LuaValue[]) => {
        if (args.length === 0) return { type: 'nil', value: null };
        const val = args[0];
        if (val.type === 'number') return val;
        if (val.type === 'string') {
          const num = parseFloat(val.value);
          return isNaN(num) ? { type: 'nil', value: null } : { type: 'number', value: num };
        }
        return { type: 'nil', value: null };
      }
    });

    this.globals.set('tostring', {
      type: 'function',
      value: (args: LuaValue[]) => {
        if (args.length === 0) return { type: 'string', value: 'nil' };
        return { type: 'string', value: this.stringify(args[0]) };
      }
    });

    this.globals.set('math', {
      type: 'table',
      value: {
        array: [],
        dict: new Map([
          ['pi', { type: 'number', value: Math.PI }],
          ['huge', { type: 'number', value: Infinity }],
          ['abs', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.abs(args[0]?.value || 0) }) }],
          ['floor', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.floor(args[0]?.value || 0) }) }],
          ['ceil', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.ceil(args[0]?.value || 0) }) }],
          ['sqrt', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.sqrt(args[0]?.value || 0) }) }],
          ['random', { type: 'function', value: () => ({ type: 'number', value: Math.random() }) }],
          ['sin', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.sin(args[0]?.value || 0) }) }],
          ['cos', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: Math.cos(args[0]?.value || 0) }) }],
          ['max', { type: 'function', value: (args: LuaValue[]) => {
            const nums = args.map(a => a.value).filter(v => typeof v === 'number');
            return { type: 'number', value: Math.max(...nums) };
          }}],
          ['min', { type: 'function', value: (args: LuaValue[]) => {
            const nums = args.map(a => a.value).filter(v => typeof v === 'number');
            return { type: 'number', value: Math.min(...nums) };
          }}],
        ])
      }
    });

    this.globals.set('string', {
      type: 'table',
      value: {
        array: [],
        dict: new Map([
          ['len', { type: 'function', value: (args: LuaValue[]) => ({ type: 'number', value: (args[0]?.value || '').length }) }],
          ['sub', { type: 'function', value: (args: LuaValue[]) => {
            const s = args[0]?.value || '';
            const i = (args[1]?.value || 1) - 1;
            const j = args[2]?.value ? (args[2].value as number) : undefined;
            return { type: 'string', value: s.substring(i, j !== undefined ? i + j : undefined) };
          }}],
          ['format', { type: 'function', value: (args: LuaValue[]) => {
            const fmt = args[0]?.value || '';
            let result = fmt;
            for (let i = 1; i < args.length; i++) {
              result = result.replace('%s', String(args[i].value));
            }
            return { type: 'string', value: result };
          }}],
        ])
      }
    });

    this.globals.set('table', {
      type: 'table',
      value: {
        array: [],
        dict: new Map([
          ['insert', { type: 'function', value: (args: LuaValue[]) => {
            if (args.length < 2 || args[0].type !== 'table') return { type: 'nil', value: null };
            const tbl = args[0].value as LuaTable;
            if (args.length === 3) {
              const pos = (args[1].value as number) - 1;
              tbl.array.splice(pos, 0, args[2]);
            } else {
              tbl.array.push(args[1]);
            }
            return { type: 'nil', value: null };
          }}],
          ['remove', { type: 'function', value: (args: LuaValue[]) => {
            if (args.length < 1 || args[0].type !== 'table') return { type: 'nil', value: null };
            const tbl = args[0].value as LuaTable;
            const pos = args.length > 1 ? ((args[1].value as number) - 1) : tbl.array.length - 1;
            return tbl.array.splice(pos, 1)[0] || { type: 'nil', value: null };
          }}],
          ['concat', { type: 'function', value: (args: LuaValue[]) => {
            if (args.length < 1 || args[0].type !== 'table') return { type: 'string', value: '' };
            const tbl = args[0].value as LuaTable;
            const sep = args.length > 1 ? String(args[1].value) : '';
            return { type: 'string', value: tbl.array.map(v => this.stringify(v)).join(sep) };
          }}],
        ])
      }
    });
  }

  private stringify(value: LuaValue): string {
    switch (value.type) {
      case 'nil': return 'nil';
      case 'number':
      case 'string':
      case 'boolean':
        return String(value.value);
      case 'table': {
        const t = value.value as LuaTable;
        const parts: string[] = [];
        for (let i = 0; i < t.array.length; i++) {
          parts.push(this.stringify(t.array[i]));
        }
        t.dict.forEach((v, k) => {
          parts.push(`${k} = ${this.stringify(v)}`);
        });
        return `{ ${parts.join(', ')} }`;
      }
      default:
        return String(value.value);
    }
  }

  private tokenize(code: string): { type: string; value: string }[] {
    const tokens: { type: string; value: string }[] = [];
    let i = 0;
    const len = code.length;

    while (i < len) {
      const ch = code[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      if (ch === '-' && code[i + 1] === '-') {
        while (i < len && code[i] !== '\n') i++;
        continue;
      }

      if (ch === '"' || ch === "'") {
        const quote = ch;
        let str = '';
        i++;
        while (i < len && code[i] !== quote) {
          if (code[i] === '\\' && i + 1 < len) {
            i++;
            str += code[i];
          } else {
            str += code[i];
          }
          i++;
        }
        i++;
        tokens.push({ type: 'STRING', value: str });
        continue;
      }

      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(code[i + 1] || ''))) {
        let num = '';
        while (i < len && /[0-9.]/.test(code[i])) {
          num += code[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      if (/[a-zA-Z_]/.test(ch)) {
        let id = '';
        while (i < len && /[a-zA-Z0-9_]/.test(code[i])) {
          id += code[i];
          i++;
        }
        const keywords = ['and', 'or', 'not', 'if', 'then', 'else', 'elseif', 'end', 
                          'while', 'do', 'for', 'in', 'function', 'return', 'local', 
                          'true', 'false', 'nil', 'break'];
        tokens.push({ type: keywords.includes(id) ? id.toUpperCase() : 'IDENTIFIER', value: id });
        continue;
      }

      const twoChar = code.substring(i, i + 2);
      if (['==', '~=', '<=', '>=', '..'].includes(twoChar)) {
        tokens.push({ type: twoChar, value: twoChar });
        i += 2;
        continue;
      }

      tokens.push({ type: ch, value: ch });
      i++;
    }

    return tokens;
  }

  private parser(tokens: { type: string; value: string }[]): LuaASTNode[] {
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];
    const expect = (type: string) => {
      if (peek()?.type === type) return consume();
      throw new Error(`Expected ${type}, got ${peek()?.type}`);
    };

    const parseExpression = (): LuaASTNode => parseOr();

    const parseOr = (): LuaASTNode => {
      let left = parseAnd();
      while (peek()?.type === 'or') {
        consume();
        const right = parseAnd();
        left = { type: 'binaryOp', op: 'or', left, right };
      }
      return left;
    };

    const parseAnd = (): LuaASTNode => {
      let left = parseComparison();
      while (peek()?.type === 'and') {
        consume();
        const right = parseComparison();
        left = { type: 'binaryOp', op: 'and', left, right };
      }
      return left;
    };

    const parseComparison = (): LuaASTNode => {
      let left = parseConcat();
      const ops = ['==', '~=', '<', '>', '<=', '>='];
      while (ops.includes(peek()?.type || '')) {
        const op = consume().type;
        const right = parseConcat();
        left = { type: 'binaryOp', op, left, right };
      }
      return left;
    };

    const parseConcat = (): LuaASTNode => {
      let left = parseAdd();
      while (peek()?.type === '..') {
        consume();
        const right = parseAdd();
        left = { type: 'binaryOp', op: '..', left, right };
      }
      return left;
    };

    const parseAdd = (): LuaASTNode => {
      let left = parseMul();
      while (peek()?.type === '+' || peek()?.type === '-') {
        const op = consume().type;
        const right = parseMul();
        left = { type: 'binaryOp', op, left, right };
      }
      return left;
    };

    const parseMul = (): LuaASTNode => {
      let left = parseUnary();
      while (peek()?.type === '*' || peek()?.type === '/' || peek()?.type === '%') {
        const op = consume().type;
        const right = parseUnary();
        left = { type: 'binaryOp', op, left, right };
      }
      return left;
    };

    const parseUnary = (): LuaASTNode => {
      if (peek()?.type === 'not' || peek()?.type === '-') {
        const op = consume().type;
        const operand = parseUnary();
        return { type: 'unaryOp', op: op === 'not' ? 'not' : '-', operand };
      }
      return parsePrimary();
    };

    const parsePrimary = (): LuaASTNode => {
      const token = peek();

      if (token?.type === 'NUMBER') {
        consume();
        return { type: 'number', value: parseFloat(token.value) };
      }

      if (token?.type === 'STRING') {
        consume();
        return { type: 'string', value: token.value };
      }

      if (token?.type === 'true') {
        consume();
        return { type: 'boolean', value: true };
      }

      if (token?.type === 'false') {
        consume();
        return { type: 'boolean', value: false };
      }

      if (token?.type === 'nil') {
        consume();
        return { type: 'nil' };
      }

      if (token?.type === 'IDENTIFIER') {
        consume();
        const name = token.value;
        
        if (peek()?.type === '(' || peek()?.type === 'IDENTIFIER' && tokens[pos + 1]?.type === '=') {
          return { type: 'functionCall', name, args: [] };
        }
        
        if (peek()?.type === '[') {
          consume();
          const index = parseExpression();
          expect(']');
          return { type: 'indexAccess', base: { type: 'identifier', name }, index };
        }
        
        if (peek()?.type === '.') {
          let base: LuaASTNode = { type: 'identifier', name };
          while (peek()?.type === '.') {
            consume();
            const key = expect('IDENTIFIER').value;
            base = { type: 'indexAccess', base, index: { type: 'string', value: key } };
          }
          return base;
        }
        
        return { type: 'identifier', name };
      }

      if (token?.type === '(') {
        consume();
        const expr = parseExpression();
        expect(')');
        return expr;
      }

      if (token?.type === '{') {
        return parseTableConstructor();
      }

      if (token?.type === 'function') {
        return parseFunctionDef();
      }

      throw new Error(`Unexpected token: ${token?.type}`);
    };

    const parseTableConstructor = (): LuaASTNode => {
      expect('{');
      const fields: { key?: LuaASTNode; value: LuaASTNode }[] = [];

      while (peek()?.type !== '}') {
        let key: LuaASTNode | undefined;
        let value: LuaASTNode;

        if (peek()?.type === '[') {
          consume();
          key = parseExpression();
          expect(']');
          expect('=');
          value = parseExpression();
        } else if (peek()?.type === 'IDENTIFIER' && tokens[pos + 1]?.type === '=') {
          const name = consume().value;
          expect('=');
          value = parseExpression();
          key = { type: 'string', value: name };
        } else {
          value = parseExpression();
        }

        fields.push({ key, value });

        if (peek()?.type !== '}') {
          expect(',');
        }
      }

      expect('}');
      return { type: 'tableConstructor', fields };
    };

    const parseFunctionDef = (): LuaASTNode => {
      expect('function');
      let name: string | undefined;
      
      if (peek()?.type === 'IDENTIFIER') {
        name = consume().value;
        if (peek()?.type === ':') {
          consume();
          const methodName = expect('IDENTIFIER').value;
          name = `${name}:${methodName}`;
        }
      }

      expect('(');
      const params: string[] = [];
      while (peek()?.type !== ')') {
        if (peek()?.type === 'IDENTIFIER') {
          params.push(consume().value);
        }
        if (peek()?.type === ',') consume();
      }
      expect(')');

      const body = parseBlock();
      expect('end');

      return { type: 'functionDef', name, params, body };
    };

    const parseBlock = (): LuaASTNode[] => {
      const statements: LuaASTNode[] = [];
      while (peek() && peek()!.type !== 'end' && peek()!.type !== 'else' && 
             peek()!.type !== 'elseif' && peek()!.type !== 'until' && peek()?.type !== '}') {
        statements.push(parseStatement());
      }
      return statements;
    };

    const parseStatement = (): LuaASTNode => {
      const token = peek();

      if (token?.type === 'local') {
        consume();
        if (peek()?.type === 'function') {
          consume();
          const name = expect('IDENTIFIER').value;
          return parseLocalFunction(name);
        }
        const names: string[] = [];
        while (peek()?.type === 'IDENTIFIER') {
          names.push(consume().value);
        }
        expect('=');
        const exprs: LuaASTNode[] = [];
        exprs.push(parseExpression());
        while (peek()?.type === ',') {
          consume();
          exprs.push(parseExpression());
        }
        return { type: 'assignment', names, exprs };
      }

      if (token?.type === 'if') {
        return parseIf();
      }

      if (token?.type === 'while') {
        return parseWhile();
      }

      if (token?.type === 'for') {
        return parseFor();
      }

      if (token?.type === 'function') {
        return parseFunctionDef();
      }

      if (token?.type === 'return') {
        consume();
        let value: LuaASTNode | undefined;
        if (peek() && peek()!.type !== 'end' && peek()!.type !== ';' &&
            peek()!.type !== 'else' && peek()!.type !== 'elseif' && peek()!.type !== 'until') {
          value = parseExpression();
        }
        return { type: 'return', value };
      }

      if (token?.type === 'break') {
        consume();
        return { type: 'break' };
      }

      if (token?.type === 'IDENTIFIER') {
        const name = consume().value;
        
        if (peek()?.type === '=') {
          consume();
          const exprs: LuaASTNode[] = [];
          exprs.push(parseExpression());
          while (peek()?.type === ',') {
            consume();
            exprs.push(parseExpression());
          }
          return { type: 'assignment', names: [name], exprs };
        }
        
        if (peek()?.type === '(') {
          consume();
          const args: LuaASTNode[] = [];
          while (peek()?.type !== ')') {
            if (peek()) args.push(parseExpression());
            if (peek()?.type !== ')') expect(',');
          }
          expect(')');
          return { type: 'functionCall', name, args };
        }
        
        if (peek()?.type === ':') {
          consume();
          const methodName = expect('IDENTIFIER').value;
          expect('(');
          const args: LuaASTNode[] = [];
          while (peek()?.type !== ')') {
            if (peek()) args.push(parseExpression());
            if (peek()?.type !== ')') expect(',');
          }
          expect(')');
          return { type: 'functionCall', name: `${name}:${methodName}`, args };
        }
        
        return { type: 'functionCall', name, args: [] };
      }

      if (token?.type === 'call') {
        consume();
        const expr = parseExpression();
        expect('(');
        const args: LuaASTNode[] = [];
        while (peek()?.type !== ')') {
          if (peek()) args.push(parseExpression());
          if (peek()?.type !== ')') expect(',');
        }
        expect(')');
        return { type: 'call', expr, args };
      }

      throw new Error(`Unexpected statement: ${token?.type}`);
    };

    const parseLocalFunction = (name: string): LuaASTNode => {
      expect('(');
      const params: string[] = [];
      while (peek()?.type !== ')') {
        if (peek()?.type === 'IDENTIFIER') {
          params.push(consume().value);
        }
        if (peek()?.type === ',') consume();
      }
      expect(')');
      const body = parseBlock();
      expect('end');
      return { type: 'functionDef', name, params, body };
    };

    const parseIf = (): LuaASTNode => {
      expect('if');
      const condition = parseExpression();
      expect('then');
      const thenBody = parseBlock();
      const elseIfs: { condition: LuaASTNode; body: LuaASTNode[] }[] = [];
      let elseBody: LuaASTNode[] | undefined;

      while (peek()?.type === 'elseif') {
        consume();
        const elseifCond = parseExpression();
        expect('then');
        const elseifBody = parseBlock();
        elseIfs.push({ condition: elseifCond, body: elseifBody });
      }

      if (peek()?.type === 'else') {
        consume();
        elseBody = parseBlock();
      }

      expect('end');
      return { type: 'if', condition, thenBody, elseIfs, elseBody };
    };

    const parseWhile = (): LuaASTNode => {
      expect('while');
      const condition = parseExpression();
      expect('do');
      const body = parseBlock();
      expect('end');
      return { type: 'while', condition, body };
    };

    const parseFor = (): LuaASTNode => {
      expect('for');
      const variable = expect('IDENTIFIER').value;
      expect('=');
      const start = parseExpression();
      expect(',');
      const end = parseExpression();
      let step: LuaASTNode | undefined;
      if (peek()?.type === ',') {
        consume();
        step = parseExpression();
      }
      expect('do');
      const body = parseBlock();
      expect('end');
      return { type: 'for', variable, start, end, step, body };
    };

    const statements: LuaASTNode[] = [];
    while (pos < tokens.length) {
      statements.push(parseStatement());
    }
    return statements;
  }

  private evaluate(node: LuaASTNode, scope?: Map<string, LuaValue>): LuaValue {
    if (this.breakRequested) return { type: 'nil', value: null };
    if (this.returnRequested !== null) return this.returnRequested;

    switch (node.type) {
      case 'number':
        return { type: 'number', value: node.value };

      case 'string':
        return { type: 'string', value: node.value };

      case 'boolean':
        return { type: 'boolean', value: node.value };

      case 'nil':
        return { type: 'nil', value: null };

      case 'identifier': {
        if (scope?.has(node.name)) {
          return scope.get(node.name)!;
        }
        if (this.globals.has(node.name)) {
          return this.globals.get(node.name)!;
        }
        return { type: 'nil', value: null };
      }

      case 'tableConstructor': {
        const table: LuaTable = { array: [], dict: new Map() };
        for (const field of node.fields) {
          const value = this.evaluate(field.value, scope);
          if (field.key) {
            const keyVal = this.evaluate(field.key, scope);
            if (keyVal.type === 'number') {
              table.array[keyVal.value - 1] = value;
            } else if (keyVal.type === 'string') {
              table.dict.set(keyVal.value, value);
            }
          } else {
            table.array.push(value);
          }
        }
        return { type: 'table', value: table };
      }

      case 'indexAccess': {
        const base = this.evaluate(node.base, scope);
        const index = this.evaluate(node.index, scope);
        
        if (base.type === 'table') {
          if (index.type === 'number') {
            return base.value.array[index.value - 1] || { type: 'nil', value: null };
          } else if (index.type === 'string') {
            const val = base.value.dict.get(index.value);
            if (val) return val;
            const funcVal = base.value.dict.get(index.value);
            if (funcVal) return funcVal;
            return { type: 'nil', value: null };
          }
        } else if (base.type === 'string' && index.type === 'number') {
          return { type: 'string', value: base.value[index.value - 1] || '' };
        }
        return { type: 'nil', value: null };
      }

      case 'binaryOp': {
        const left = this.evaluate(node.left, scope);
        const right = this.evaluate(node.right, scope);

        switch (node.op) {
          case '+': return { type: 'number', value: (left.value as number) + (right.value as number) };
          case '-': return { type: 'number', value: (left.value as number) - (right.value as number) };
          case '*': return { type: 'number', value: (left.value as number) * (right.value as number) };
          case '/': return { type: 'number', value: (left.value as number) / (right.value as number) };
          case '%': return { type: 'number', value: (left.value as number) % (right.value as number) };
          case '==': return { type: 'boolean', value: left.value === right.value && left.type === right.type };
          case '~=': return { type: 'boolean', value: left.value !== right.value || left.type !== right.type };
          case '<': return { type: 'boolean', value: (left.value as number) < (right.value as number) };
          case '>': return { type: 'boolean', value: (left.value as number) > (right.value as number) };
          case '<=': return { type: 'boolean', value: (left.value as number) <= (right.value as number) };
          case '>=': return { type: 'boolean', value: (left.value as number) >= (right.value as number) };
          case 'and': return left.value ? right : left;
          case 'or': return left.value ? left : right;
          case '..': return { type: 'string', value: String(left.value) + String(right.value) };
          default: throw new Error(`Unknown operator: ${node.op}`);
        }
      }

      case 'unaryOp': {
        const operand = this.evaluate(node.operand, scope);
        switch (node.op) {
          case '-': return { type: 'number', value: -(operand.value as number) };
          case 'not': return { type: 'boolean', value: !operand.value };
          default: throw new Error(`Unknown unary operator: ${node.op}`);
        }
      }

      case 'assignment': {
        const values = node.exprs.map(expr => this.evaluate(expr, scope));
        for (let i = 0; i < node.names.length; i++) {
          const value = values[i] || { type: 'nil', value: null };
          if (scope?.has(node.names[i])) {
            scope.set(node.names[i], value);
          } else {
            this.globals.set(node.names[i], value);
          }
        }
        return values[0] || { type: 'nil', value: null };
      }

      case 'functionDef': {
        const func: LuaFunction = {
          params: node.params,
          body: node.body,
          closure: new Map(this.globals)
        };
        if (node.name) {
          if (scope) {
            scope.set(node.name, { type: 'function', value: func });
          } else {
            this.globals.set(node.name, { type: 'function', value: func });
          }
        }
        return { type: 'function', value: func };
      }

      case 'functionCall': {
        const funcVal = this.getValue(node.name, scope);
        if (funcVal.type === 'function' && typeof funcVal.value === 'function') {
          const args = node.args.map(arg => this.evaluate(arg, scope));
          return funcVal.value(args);
        } else if (funcVal.type === 'function') {
          const func = funcVal.value as LuaFunction;
          const args = node.args.map(arg => this.evaluate(arg, scope));
          return this.executeFunction(func, args);
        }
        throw new Error(`${node.name} is not a function`);
      }

      case 'call': {
        const exprVal = this.evaluate(node.expr, scope);
        if (exprVal.type === 'function' && typeof exprVal.value === 'function') {
          const args = node.args.map(arg => this.evaluate(arg, scope));
          return exprVal.value(args);
        }
        throw new Error('Cannot call non-function');
      }

      case 'if': {
        const condition = this.evaluate(node.condition, scope);
        if (condition.value) {
          this.localScopes.push(new Map(scope || this.globals));
          for (const stmt of node.thenBody) {
            this.evaluate(stmt, this.localScopes[this.localScopes.length - 1]);
            if (this.breakRequested || this.returnRequested !== null) break;
          }
          this.localScopes.pop();
        } else {
          let executed = false;
          for (const elseif of node.elseIfs) {
            const elseifCond = this.evaluate(elseif.condition, scope);
            if (elseifCond.value) {
              this.localScopes.push(new Map(scope || this.globals));
              for (const stmt of elseif.body) {
                this.evaluate(stmt, this.localScopes[this.localScopes.length - 1]);
                if (this.breakRequested || this.returnRequested !== null) break;
              }
              this.localScopes.pop();
              executed = true;
              break;
            }
          }
          if (!executed && node.elseBody) {
            this.localScopes.push(new Map(scope || this.globals));
            for (const stmt of node.elseBody) {
              this.evaluate(stmt, this.localScopes[this.localScopes.length - 1]);
              if (this.breakRequested || this.returnRequested !== null) break;
            }
            this.localScopes.pop();
          }
        }
        return { type: 'nil', value: null };
      }

      case 'while': {
        while (this.evaluate(node.condition, scope).value) {
          this.localScopes.push(new Map(scope || this.globals));
          for (const stmt of node.body) {
            this.evaluate(stmt, this.localScopes[this.localScopes.length - 1]);
            if (this.breakRequested) {
              this.breakRequested = false;
              this.localScopes.pop();
              return { type: 'nil', value: null };
            }
            if (this.returnRequested !== null) {
              this.localScopes.pop();
              return this.returnRequested;
            }
          }
          this.localScopes.pop();
        }
        return { type: 'nil', value: null };
      }

      case 'for': {
        const startVal = this.evaluate(node.start, scope).value as number;
        const endVal = this.evaluate(node.end, scope).value as number;
        const stepVal = node.step ? this.evaluate(node.step, scope).value as number : 1;
        const forScope = new Map(scope || this.globals);
        
        for (let i = startVal; stepVal > 0 ? i <= endVal : i >= endVal; i += stepVal) {
          forScope.set(node.variable, { type: 'number', value: i });
          this.localScopes.push(forScope);
          for (const stmt of node.body) {
            this.evaluate(stmt, forScope);
            if (this.breakRequested) {
              this.breakRequested = false;
              this.localScopes.pop();
              return { type: 'nil', value: null };
            }
            if (this.returnRequested !== null) {
              this.localScopes.pop();
              return this.returnRequested;
            }
          }
          this.localScopes.pop();
        }
        return { type: 'nil', value: null };
      }

      case 'return':
        this.returnRequested = node.value ? this.evaluate(node.value, scope) : { type: 'nil', value: null };
        return this.returnRequested;

      case 'break':
        this.breakRequested = true;
        return { type: 'nil', value: null };

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  private getValue(name: string, scope?: Map<string, LuaValue>): LuaValue {
    if (scope?.has(name)) return scope.get(name)!;
    if (this.globals.has(name)) return this.globals.get(name)!;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      let current: LuaValue | undefined = this.getValue(parts[0], scope);
      for (let i = 1; i < parts.length; i++) {
        if (current?.type === 'table') {
          current = current.value.dict.get(parts[i]) || { type: 'nil', value: null };
        } else {
          return { type: 'nil', value: null };
        }
      }
      return current;
    }
    
    return { type: 'nil', value: null };
  }

  private executeFunction(func: LuaFunction, args: LuaValue[]): LuaValue {
    const funcScope = new Map(func.closure);
    for (let i = 0; i < func.params.length; i++) {
      funcScope.set(func.params[i], args[i] || { type: 'nil', value: null });
    }

    this.localScopes.push(funcScope);
    this.returnRequested = null;

    for (const stmt of func.body) {
      this.evaluate(stmt, funcScope);
      if (this.returnRequested !== null || this.breakRequested) break;
    }

    this.localScopes.pop();
    const result = this.returnRequested;
    this.returnRequested = null;
    return result || { type: 'nil', value: null };
  }

  public execute(code: string): LuaExecutionResult {
    this.output = [];
    this.breakRequested = false;
    this.returnRequested = null;

    try {
      const tokens = this.tokenize(code);
      const ast = this.parser(tokens);

      let result: LuaValue = { type: 'nil', value: null };
      for (const node of ast) {
        result = this.evaluate(node);
        if (this.breakRequested || this.returnRequested !== null) break;
      }

      return {
        success: true,
        returnValue: result,
        output: this.output.length > 0 ? this.output : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  public executeStatement(node: LuaASTNode, scope: Map<string, LuaValue>): LuaValue {
    return this.evaluate(node, scope);
  }

  public setGlobal(name: string, value: any): void {
    this.globals.set(name, this.toLuaValue(value));
  }

  public getGlobal(name: string): LuaValue | undefined {
    return this.globals.get(name);
  }

  private toLuaValue(value: any): LuaValue {
    if (value === null || value === undefined) return { type: 'nil', value: null };
    if (typeof value === 'number') return { type: 'number', value };
    if (typeof value === 'string') return { type: 'string', value };
    if (typeof value === 'boolean') return { type: 'boolean', value };
    if (Array.isArray(value)) {
      return {
        type: 'table',
        value: {
          array: value.map(v => this.toLuaValue(v)),
          dict: new Map()
        }
      };
    }
    if (typeof value === 'object') {
      const dict = new Map<string, LuaValue>();
      for (const [k, v] of Object.entries(value)) {
        dict.set(k, this.toLuaValue(v));
      }
      return { type: 'table', value: { array: [], dict } };
    }
    return { type: 'userdata', value };
  }

  public getOutput(): string[] {
    return [...this.output];
  }

  public reset(): void {
    this.globals.clear();
    this.output = [];
    this.breakRequested = false;
    this.returnRequested = null;
    this.localScopes = [];
    this.setupBuiltins();
  }
}
