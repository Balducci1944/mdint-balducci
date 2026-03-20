
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIUwMugdddsT35FpeNo-JG-wKapwVfLMq1iXEqtfBiUWwhbdlQwB5Yl8GrZ_jNWLx-3A/exec";

var CL_ROWS = [
  ['v_cond','Controllo condizioni esterne','note...','V'],
  ['v_vibr','Controllo vibrazioni','mm/s...','V'],
  ['v_mot','Controllo motore','A / kW...','V'],
  ['v_cinghie','Cinghie di trasmissione / monoblocco','stato...','V'],
  ['v_giunti','Giunti antivibranti','stato...','V'],
  ['v_amm','Ammortizzatori','stato...','V'],
  ['v_mono','Monoblocco','stato...','V'],
  ['v_gir','Condizioni girante (portina)','stato...','V'],
  ['f_cond','Controllo condizioni esterne','note...','F'],
  ['f_serb','Serbatoi / sequenza elettrovalvole','bar...','F'],
  ['f_seq','Sequenziatore tipo','tipo...','F'],
  ['f_pausa','Secondi pausa tra impulsi','sec...','F'],
  ['f_dp','Lettura perdita di carico \u0394p','Pa...','F'],
  ['f_cent','Modifica parametri centralina','note...','F'],
  ['f_cond2','Scarico condensa','lt...','F'],
  ['f_filt','Controllo / pulizia elementi filtranti','stato...','F'],
  ['f_vel','Velocit\u00e0 sui punti di aspirazione','m/s...','F'],
  ['f_emiss','Controllo dispositivo Emissioni OK','note...','F'],
  ['f_ore','Controllo ore funzionamento','h...','F'],
  ['f_bid','Controllo bidone raccolta polveri','%...','F'],
  ['f_temp','Temperatura esterna','\u00b0C...','F']
];

function buildCL() {
  var h = '<div class="cl">', lg = '';
  for (var i = 0; i < CL_ROWS.length; i++) {
    var r=CL_ROWS[i], k=r[0], lb=r[1], ph=r[2], g=r[3];
    if (g !== lg) {
      h += '<div class="cl-sub">'+(g==='V'?'\uD83C\uDF00 Ventilatore':'\uD83D\uDD35 Filtro')+'</div><div class="cl-head"><span>Operazione</span><span>Esito</span></div>';
      lg = g;
    }
    h += '<div class="cl-row"><div class="cl-top"><span class="cl-lbl">'+lb+'</span>'
      +'<select class="yn" data-key="'+k+'" onchange="styleYN(this);trackProg()">'
      +'<option value="">\u2014 seleziona \u2014</option>'
      +'<option value="S\u00ec">\u2705 S\u00ec</option>'
      +'<option value="No">\u274C No</option>'
      +'<option value="N/A">\u2014 N/A</option>'
      +'</select></div>'
      +'<div class="cl-note"><input type="text" data-note="'+k+'" placeholder="'+ph+'"></div></div>';
  }
  return h + '</div>';
}

var impCount = 0;

function addImpianto(imp) {
  imp = imp || {};
  impCount++;
  var id = 'imp' + Date.now();
  var div = document.createElement('div');
  div.className = 'ib'; div.id = id;
  var rmBtn = impCount > 1 ? '<button class="btn-rm" onclick="removeImp(\''+id+'\')">&#x2715; Rimuovi</button>' : '';
  div.innerHTML =
    '<div class="ihead">'
      +'<span class="inum">Impianto '+impCount+'</span>'
      +'<input class="iname" type="text" placeholder="Nome impianto" value="'+(imp.nome||'')+'">'
      +rmBtn
    +'</div>'
    +'<div class="itabs">'
      +'<div class="itab active" onclick="swTab(this,\'d'+id+'\')">&#x1F4CB; Dati Impianto</div>'
      +'<div class="itab" onclick="swTab(this,\'c'+id+'\')">&#x2705; Checklist</div>'
      +'<div class="itab" onclick="swTab(this,\'n'+id+'\')">&#x1F4DD; Note &amp; Foto</div>'
    +'</div>'
    +'<div class="ipanel active" id="d'+id+'">'
      +'<div class="fg-grid g3">'
        +'<div class="fg full"><label class="lbl">Denominazione Impianto</label><input type="text" class="id-denom" placeholder="Es. Depolveratore reparto verniciatura" value="'+(imp.denom||'')+'"></div>'
        +'<div class="fg"><label class="lbl">Marca Depolveratore</label><input type="text" class="id-marcadepolv" placeholder="Es. Camfil" value="'+(imp.marcadepolv||'')+'"></div>'
        +'<div class="fg"><label class="lbl">N&deg; Matricola Filtro</label><input type="text" class="id-matfiltro" placeholder="Es. CF-2019-4421" value="'+(imp.matfiltro||'')+'"></div>'
        +'<div class="fg"><label class="lbl">Emissione N&deg;</label><input type="text" class="id-emissione" placeholder="Es. E-07" value="'+(imp.emissione||'')+'"></div>'
        +'<div class="fg"><label class="lbl">Marca Ventilatore</label><input type="text" class="id-marcavent" placeholder="Es. Ziehl-Abegg" value="'+(imp.marcavent||'')+'"></div>'
        +'<div class="fg"><label class="lbl">N&deg; Matricola Ventilatore</label><input type="text" class="id-matvent" placeholder="Es. ZA-2019-8832" value="'+(imp.matvent||'')+'"></div>'
        +'<div class="fg"><label class="lbl">Anno Fornitura</label><input type="text" class="id-anno" placeholder="Es. 2019" value="'+(imp.anno||'')+'"></div>'
        +'<div class="fg"><label class="lbl">N&deg; Elementi</label><input type="text" class="id-nelem" placeholder="Es. 24" value="'+(imp.nelem||'')+'"></div>'
        +'<div class="fg"><label class="lbl">Dimensioni</label><input type="text" class="id-dim" placeholder="Es. 325 x 660 mm" value="'+(imp.dim||'')+'"></div>'
      +'</div>'
      +'<div class="div"></div>'
      +'<div class="fg"><label class="lbl">Tipologia Filtro</label><div class="chips">'
        +['Maniche','Cartucce','Tasche','Carbone','Altro'].map(function(t){
          var a = imp.filtro && imp.filtro.indexOf(t)>-1 ? ' active':'';
          return '<span class="chip'+a+'" onclick="this.classList.toggle(\'active\');trackProg()">'+t+'</span>';
        }).join('')
      +'</div></div>'
    +'</div>'
    +'<div class="ipanel" id="c'+id+'">'+buildCL()+'</div>'
    +'<div class="ipanel" id="n'+id+'">'
      +'<div class="fg" style="margin-bottom:18px"><label class="lbl">Note varie / anomalie</label>'
        +'<textarea data-ng placeholder="Anomalie, interventi, raccomandazioni..."></textarea></div>'
      +'<div class="fg"><label class="lbl">Foto intervento</label>'
        +'<div class="upz" onclick="this.querySelector(\'input\').click()">'
          +'<input type="file" accept="image/*" multiple capture="environment" onchange="handlePh(this)">'
          +'<div style="font-size:30px;margin-bottom:6px">&#x1F4F7;</div>'
          +'<div style="font-size:14px;font-weight:600;margin-bottom:3px">Scatta o allega foto</div>'
          +'<div style="font-size:12px;color:var(--g400)">Tocca per aprire la fotocamera</div>'
        +'</div><div class="pg"></div></div>'
    +'</div>';
  document.getElementById('iCont').appendChild(div);
  div.scrollIntoView({behavior:'smooth',block:'start'});
  trackProg();
}

function removeImp(id) {
  if (!confirm('Rimuovere questo impianto?')) return;
  document.getElementById(id).remove();
  document.querySelectorAll('.ib').forEach(function(b,i){
    var s=b.querySelector('.inum'); if(s) s.textContent='Impianto '+(i+1);
  });
  impCount = document.querySelectorAll('.ib').length;
  trackProg();
}

function swTab(tab,pid) {
  var b=tab.closest('.ib');
  b.querySelectorAll('.itab').forEach(function(t){t.classList.remove('active');});
  b.querySelectorAll('.ipanel').forEach(function(p){p.classList.remove('active');});
  tab.classList.add('active');
  document.getElementById(pid).classList.add('active');
}

function styleYN(sel) {
  sel.classList.remove('si','no','na');
  if(sel.value==='S\u00ec') sel.classList.add('si');
  else if(sel.value==='No') sel.classList.add('no');
  else if(sel.value==='N/A') sel.classList.add('na');
}

function handlePh(input) {
  var grid=input.closest('.ipanel').querySelector('.pg');
  Array.from(input.files).forEach(function(file){
    var r=new FileReader();
    r.onload=function(e){
      var d=document.createElement('div'); d.className='pt2';
      d.innerHTML='<img src="'+e.target.result+'"><button class="pdel" onclick="this.parentElement.remove()">&#x2715;</button>';
      grid.appendChild(d);
    };
    r.readAsDataURL(file);
  });
  input.value='';
}

document.getElementById('opList').addEventListener('click',function(e){
  var item=e.target.closest('.op-item'); if(item){item.classList.toggle('sel');trackProg();}
});
document.getElementById('btnAdd').addEventListener('click',function(){addImpianto();});

var sigC=document.getElementById('sigC'), ctx=sigC.getContext('2d'), drawing=false;
function pt(e){var r=sigC.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*(sigC.width/r.width),y:(s.clientY-r.top)*(sigC.height/r.height)};}
sigC.addEventListener('mousedown',function(e){drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);});
sigC.addEventListener('mousemove',function(e){if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();});
sigC.addEventListener('mouseup',function(){drawing=false;});
sigC.addEventListener('mouseleave',function(){drawing=false;});
sigC.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);},{passive:false});
sigC.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();},{passive:false});
sigC.addEventListener('touchend',function(){drawing=false;});
document.getElementById('btnSigClr').addEventListener('click',function(){ctx.clearRect(0,0,sigC.width,sigC.height);});

document.getElementById('dComp').valueAsDate=new Date();

function trackProg(){
  var n=document.querySelectorAll('.ib').length;
  var sels=document.querySelectorAll('.yn'),ops=document.querySelectorAll('.op-item.sel'),dates=document.querySelectorAll('input[type=date]');
  var f=0,t=0;
  for(var i=0;i<sels.length;i++){t++;if(sels[i].value)f++;}
  for(var i=0;i<dates.length;i++){t++;if(dates[i].value)f++;}
  t++;if(ops.length)f++;
  var pct=t?Math.round(f/t*100):0;
  document.getElementById('pFill').style.width=pct+'%';
  document.getElementById('pPct').textContent=pct+'%';
  document.getElementById('subInfo').textContent=n===0?'Aggiungi almeno un impianto per iniziare':pct<100?n+' impianto/i \u00b7 '+pct+'%':'\u2705 Completo \u2014 '+n+' impianto/i';
}
document.addEventListener('input',trackProg);
document.addEventListener('change',trackProg);

function showToast(msg,type,dur){
  var t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show'+(type?' '+type:'');
  setTimeout(function(){t.className='toast';},dur||3000);
}

function collectData(){
  var impianti=[];
  document.querySelectorAll('.ib').forEach(function(b){
    var cl={};
    b.querySelectorAll('.yn[data-key]').forEach(function(s){
      cl[s.dataset.key]=s.value;
      var ni=b.querySelector('[data-note="'+s.dataset.key+'"]');
      if(ni) cl[s.dataset.key+'_nota']=ni.value;
    });
    var chips=[];
    b.querySelectorAll('.chip.active').forEach(function(c){chips.push(c.textContent.trim());});
    function gv(cls){var el=b.querySelector('.'+cls);return el?el.value:'';}
    var nt=b.querySelector('[data-ng]');
    impianti.push({
      nome:           b.querySelector('.iname').value,
      denominazione:  gv('id-denom'),
      anno:           gv('id-anno'),
      marcaDepolv:    gv('id-marcadepolv'),
      matricolaFiltro:gv('id-matfiltro'),
      emissione:      gv('id-emissione'),
      marcaVent:      gv('id-marcavent'),
      matricolaVent:  gv('id-matvent'),
      nElementi:      gv('id-nelem'),
      dimensioni:     gv('id-dim'),
      filtroTipo:     chips,
      checklist:      cl,
      note:           nt?nt.value:''
    });
  });
  var ops=[];
  document.querySelectorAll('.op-item.sel .op-name').forEach(function(o){ops.push(o.textContent);});
  return{
    cliente:            document.getElementById('vCliente').textContent,
    indirizzo:          document.getElementById('vIndirizzo').textContent,
    telefono:           document.getElementById('vTel').textContent,
    mail:               document.getElementById('vMail').textContent,
    commessa:           document.getElementById('vComm').textContent,
    ultimaManutenzione: document.getElementById('vUltima').textContent,
    dataCompilazione:   document.getElementById('dComp').value,
    prossimoIntervento: document.getElementById('dNext').value,
    operatori:ops, impianti:impianti
  };
}

document.getElementById('btnInvia').addEventListener('click',function(){
  if(!document.querySelectorAll('.op-item.sel').length){showToast('\u26A0\uFE0F Seleziona almeno un operatore','err');return;}
  if(!document.querySelectorAll('.ib').length){showToast('\u26A0\uFE0F Aggiungi almeno un impianto','err');return;}
  var btn=document.getElementById('btnInvia');
  btn.disabled=true; btn.innerHTML='<span class="spin"></span> Invio...';
  var data=collectData();
  fetch(SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(){
      btn.disabled=false; btn.innerHTML='\uD83D\uDCE4 Invia Rapporto';
      document.getElementById('modalTxt').textContent='Salvato su Google Sheets!\nImpianti: '+data.impianti.length+' \u00b7 Operatori: '+data.operatori.join(', ');
      document.getElementById('modalOk').classList.add('show');
    }).catch(function(){
      btn.disabled=false; btn.innerHTML='\uD83D\uDCE4 Invia Rapporto';
      showToast('\u274C Errore di rete \u2014 riprova','err',4000);
    });
});

document.getElementById('btnDraft').addEventListener('click',function(){showToast('\uD83D\uDCBE Bozza salvata','ok');});

document.getElementById('btnReset').addEventListener('click',function(){
  document.getElementById('modalOk').classList.remove('show');
  document.getElementById('iCont').innerHTML=''; impCount=0;
  document.querySelectorAll('.op-item.sel').forEach(function(o){o.classList.remove('sel');});
  document.getElementById('dComp').valueAsDate=new Date();
  document.getElementById('dNext').value='';
  ctx.clearRect(0,0,sigC.width,sigC.height);
  addImpianto();
  window.scrollTo({top:0,behavior:'smooth'});
});

// Leggi parametri URL e precompila
(function(){
  var p=new URLSearchParams(window.location.search);
  function setRO(id,val){var el=document.getElementById(id);if(el&&val&&val!=='—')el.textContent=val;}
  setRO('vCliente', p.get('cliente'));
  setRO('vIndirizzo',p.get('indirizzo'));
  setRO('vTel',     p.get('tel'));
  setRO('vMail',    p.get('mail'));
  setRO('vComm',    p.get('commessa'));
  setRO('vUltima',  p.get('ultima'));
  if(p.get('data')){var d=new Date(p.get('data'));if(!isNaN(d))document.getElementById('dComp').valueAsDate=d;}

  // Mostra banner se precompilato
  if(p.get('cliente')){
    var banner=document.createElement('div');
    banner.style.cssText='background:#edf7f0;border:1px solid #4caf7d;border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:13px;color:#2d7a50;display:flex;align-items:center;gap:8px';
    banner.innerHTML='<span style="font-size:18px">&#x2705;</span><span>Form precompilato per <strong>'+(p.get('cliente')||'')+'</strong></span>';
    document.querySelector('.con').insertBefore(banner,document.querySelector('.con').firstChild);
  }

  // Carica impianti dall'URL
  var urlImpianti=null;
  if(p.get('impianti')){try{urlImpianti=JSON.parse(p.get('impianti'));}catch(e){}}

  if(urlImpianti&&urlImpianti.length>0){
    urlImpianti.forEach(function(imp){addImpianto(imp);});
  } else {
    addImpianto();
  }
})();
