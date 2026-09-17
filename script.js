(function(){
  const currentEl = document.getElementById('current');
  const prevEl = document.getElementById('prev');

  let current = '0';
  let previousValue = null;
  let pendingOp = null;
  let overwrite = true;

  function render(){
    currentEl.textContent = formatDisplay(current);
    prevEl.textContent = previousValue !== null && pendingOp
      ? `${formatDisplay(String(previousValue))} ${pendingOp}`
      : '\u00A0';
  }

  function formatDisplay(str){
    if(str === 'Error') return str;
    if(str.length > 12) {
      const num = parseFloat(str);
      if(!isNaN(num)) return num.toPrecision(8).replace(/\.?0+$/,'');
    }
    return str;
  }

  function inputNumber(n){
    if(current === 'Error') { current = '0'; overwrite = true; }
    if(overwrite){
      current = (n === '0') ? '0' : n;
      overwrite = false;
    } else {
      if(current.replace('-','').length >= 14) return;
      current = current === '0' ? n : current + n;
    }
    render();
  }

  function inputDecimal(){
    if(current === 'Error'){ current = '0'; overwrite = true; }
    if(overwrite){ current = '0.'; overwrite = false; render(); return; }
    if(!current.includes('.')) current += '.';
    render();
  }

  function clearAll(){
    current = '0'; previousValue = null; pendingOp = null; overwrite = true;
    render();
  }

  function toggleSign(){
    if(current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    render();
  }

  function percent(){
    if(current === 'Error') return;
    current = String(parseFloat(current) / 100);
    render();
  }

  function compute(a, b, op){
    switch(op){
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function chooseOp(op){
    if(current === 'Error') return;
    if(pendingOp && !overwrite){
      const result = compute(previousValue, parseFloat(current), pendingOp);
      previousValue = isNaN(result) ? null : result;
      current = isNaN(result) ? 'Error' : String(result);
    } else {
      previousValue = parseFloat(current);
    }
    pendingOp = op;
    overwrite = true;
    render();
  }

  function equals(){
    if(pendingOp === null || previousValue === null || current === 'Error') return;
    const result = compute(previousValue, parseFloat(current), pendingOp);
    current = isNaN(result) ? 'Error' : trimResult(result);
    previousValue = null;
    pendingOp = null;
    overwrite = true;
    render();
  }

  function trimResult(n){
    let s = String(n);
    if(s.includes('.') && s.length > 14) s = n.toFixed(8).replace(/\.?0+$/,'');
    return s;
  }

  document.querySelectorAll('[data-num]').forEach(btn=>{
    btn.addEventListener('click', ()=> inputNumber(btn.dataset.num));
  });
  document.querySelectorAll('[data-op]').forEach(btn=>{
    btn.addEventListener('click', ()=> chooseOp(btn.dataset.op));
  });
  document.querySelector('[data-action="clear"]').addEventListener('click', clearAll);
  document.querySelector('[data-action="sign"]').addEventListener('click', toggleSign);
  document.querySelector('[data-action="percent"]').addEventListener('click', percent);
  document.querySelector('[data-action="decimal"]').addEventListener('click', inputDecimal);
  document.querySelector('[data-action="equals"]').addEventListener('click', equals);

  window.addEventListener('keydown', (e)=>{
    if(e.key >= '0' && e.key <= '9'){ inputNumber(e.key); return; }
    if(e.key === '.'){ inputDecimal(); return; }
    if(e.key === '+'){ chooseOp('+'); return; }
    if(e.key === '-'){ chooseOp('−'); return; }
    if(e.key === '*'){ chooseOp('×'); return; }
    if(e.key === '/'){ e.preventDefault(); chooseOp('÷'); return; }
    if(e.key === 'Enter' || e.key === '='){ equals(); return; }
    if(e.key === 'Backspace'){
      if(current.length > 1) current = current.slice(0,-1);
      else current = '0';
      render();
      return;
    }
    if(e.key === 'Escape'){ clearAll(); return; }
    if(e.key === '%'){ percent(); return; }
  });

  render();
})();
