// Limited offline help, not a substitute for a connected language model.
export function basicReply(message) {
  const text=String(message||'').replace(/@Nova\s*AI/gi,'').trim();
  const expression=text.toLowerCase().replace(/^(?:what(?:'s|s| is)?|calculate|solve|work out)\s*/,'').replace(/\s*(?:please)?[?!=.]*$/,'').replace(/\bplus\b/g,'+').replace(/\bminus\b/g,'-').replace(/\b(?:times|multiplied by)\b/g,'*').replace(/\bdivided by\b/g,'/').replace(/[×x]/g,'*').replace(/÷/g,'/').trim();
  if(expression.length<=256 && /\d/.test(expression) && /^[\d\s.+*/()%\-]+$/.test(expression)) {
    try {const result=calculate(expression);return `${expression} = ${Number(result.toPrecision(12))}`;}
    catch(error){return error.message==='zero'?'You can’t divide by zero.':'I couldn’t read that calculation. Try something like 5 + 5 or (12 - 2) / 5.';}
  }
  if(/^(hi|hello|hey|yo|sup)[!. ]*$/i.test(text))return 'Hi! I’m in basic mode right now. I can calculate arithmetic, but full AI chat isn’t connected yet.';
  if(/^(thanks|thank you|thx)[!. ]*$/i.test(text))return 'You’re welcome!';
  return 'Full AI chat isn’t connected right now, so I can’t answer that properly. I can still calculate things like 5 + 5. A Nova owner needs to connect the AI service for other questions.';
}
export function calculate(source){
  const tokens=source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[^\s]/g)||[];let i=0;
  function atom(){let value;if(tokens[i]==='+'){i++;return atom();}if(tokens[i]==='-'){i++;return -atom();}if(tokens[i]==='('){i++;value=sum();if(tokens[i++]!==')')throw Error('syntax');}else{if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(tokens[i]||''))throw Error('syntax');value=Number(tokens[i++]);}if(tokens[i]==='%'){i++;value/=100;}return value;}
  function product(){let value=atom();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],right=atom();if(op==='/'&&right===0)throw Error('zero');value=op==='*'?value*right:value/right;}return value;}
  function sum(){let value=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],right=product();value=op==='+'?value+right:value-right;}return value;}
  const value=sum();if(i!==tokens.length||!Number.isFinite(value))throw Error('syntax');return value;
}
