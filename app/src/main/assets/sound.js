/* Interlude sound engine. Everything is generated live except Frost's rain.
   Guiding rule: pleasing, never intrusive. No sharp starts, a soft room
   reverb on everything, and the harsh top end rolled off. */

var AC=null, master, verb, pinkBuf, brownBuf, rainBuf=null, rainReady=null;

function rnd(a,b){ return a+Math.random()*(b-a); }
function seamless(d,len,N){ for(var i=0;i<N;i++){ var w=i/N; d[i]=d[i]*w+d[len+i]*(1-w); } }
function makeNoise(sec,kind){
  var sr=AC.sampleRate, len=Math.floor(sr*sec), N=Math.floor(sr*.25), tmp=new Float32Array(len+N);
  var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
  for(var i=0;i<len+N;i++){
    var w=Math.random()*2-1;
    if(kind==='pink'){
      b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852; b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898;
      tmp[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11; b6=w*.115926;
    } else { last=(last+.02*w)/1.02; tmp[i]=last*3.5; }
  }
  seamless(tmp,len,N);
  var buf=AC.createBuffer(1,len,sr); buf.getChannelData(0).set(tmp.subarray(0,len)); return buf;
}
function makeIR(sec){
  var sr=AC.sampleRate, len=Math.floor(sr*sec), ir=AC.createBuffer(2,len,sr);
  for(var c=0;c<2;c++){ var d=ir.getChannelData(c), y=0; for(var i=0;i<len;i++){ y+=((Math.random()*2-1)-y)*.3; d[i]=y*Math.pow(1-i/len,3.2); } }
  return ir;
}
function audioInit(){
  if(AC) return AC;
  AC=new (window.AudioContext||window.webkitAudioContext)();
  if(AC.state==='suspended') AC.resume();
  var comp=AC.createDynamicsCompressor(); comp.threshold.value=-22; comp.ratio.value=3; comp.connect(AC.destination);
  var soft=AC.createBiquadFilter(); soft.type='lowpass'; soft.frequency.value=8000; soft.Q.value=.5; soft.connect(comp);
  master=AC.createGain(); master.gain.value=.85; master.connect(soft);
  verb=AC.createConvolver(); verb.buffer=makeIR(3.8); verb.connect(master);
  pinkBuf=makeNoise(6,'pink'); brownBuf=makeNoise(6,'brown');
  rainReady=new Promise(function(res){
    try{
      var bin=atob(RAIN_MP3.split(',')[1]), u=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
      AC.decodeAudioData(u.buffer,function(b){ rainBuf=b; res(); },function(){ res(); });
    }catch(_){ res(); }
  });
  return AC;
}

function G(v){ var g=AC.createGain(); g.gain.value=v||0; return g; }
function F(type,f,q){ var x=AC.createBiquadFilter(); x.type=type; x.frequency.value=f; x.Q.value=(q==null?.7:q); return x; }
function loopSrc(buf,dest,t0,t1){ var s=AC.createBufferSource(); s.buffer=buf; s.loop=true; s.connect(dest); s.start(t0, Math.random()*(buf.duration-.5)); s.stop(t1); return s; }
function playBuf(buf,dest,t0,t1){ var s=AC.createBufferSource(); s.buffer=buf; s.connect(dest); s.start(t0); s.stop(t1); return s; }
function swell(param,t0,peak,att,tEnd,rel){ param.setValueAtTime(0,t0); param.setTargetAtTime(peak,t0,att/3); if(tEnd) param.setTargetAtTime(0,tEnd,rel/3); }
function newBus(send){ var b=G(1); b.connect(master); var s=G(send); b.connect(s); s.connect(verb); return b; }

/* singing bowl: inharmonic partials, each a slightly detuned pair so it shimmers as it rings */
function bell(dest,t,f,peak,att){ att=att||.045;
  [[1,1,11],[2.71,.42,7],[5.13,.16,3.6],[8.3,.06,2]].forEach(function(p){
    [-.3,.3].forEach(function(dt){
      var o=AC.createOscillator(), g=AC.createGain();
      o.frequency.value=f*p[0]+dt*p[0];
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak*p[1]*.5,t+att); g.gain.exponentialRampToValueAtTime(.0001,t+att+p[2]);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t+att+p[2]+.1);
    });
  });
}
/* two soft bands of pink noise, shared by Breath and Drift */
function breeze(b,t,E){
  return [0,1].map(function(k){
    var bp=F('bandpass',k?560:420,k?.9:.5), g=G(), pan=AC.createStereoPanner?AC.createStereoPanner():null;
    loopSrc(pinkBuf,bp,t,E); bp.connect(g);
    if(pan){ g.connect(pan); pan.connect(b); pan.pan.value=k?-.25:.25; } else g.connect(b);
    g.gain.setValueAtTime(0,t);
    return {g:g,bp:bp,pan:pan,k:k};
  });
}

var SOUNDS={
  ink:{send:.5, play:function(b,t,T,E){
    var lp=F('lowpass',340,.4), g=G(); loopSrc(brownBuf,lp,t,E); lp.connect(g); g.connect(b);
    swell(g.gain,t,.028,3,t+T,2.5);                        // faint room air
    bell(b,t+1.5,220,.05,.12);                             // once the paper has settled
  }},
  breath:{send:.22, play:function(b,t,T,E){
    breeze(b,t,E).forEach(function(L){                     // swells with the light (4 s), settles as it shrinks (6 s)
      var lvl=L.k?.12:.22;
      for(var c=t;c<E;c+=10){
        L.g.gain.setTargetAtTime(lvl,c,1.4);        L.bp.frequency.setTargetAtTime(L.k?720:560,c,1.6);
        L.g.gain.setTargetAtTime(lvl*.12,c+4,2);    L.bp.frequency.setTargetAtTime(L.k?420:300,c+4,2.2);
      }
    });
  }},
  frost:{send:.12, play:function(b,t,T,E){
    if(!rainBuf) return;
    var sh=F('highshelf',2000,.7), lp=F('lowpass',3600,.5), g=G(); sh.gain.value=-6;
    playBuf(rainBuf,sh,t,Math.min(E+.5,t+rainBuf.duration)); sh.connect(lp); lp.connect(g); g.connect(b);
    swell(g.gain,t,.8,3.5,t+T,3.5);                        // real rain, easing in and out
  }},
  ripple:{send:.35, play:function(b,t,T,E){
    function plop(at,f0,f1,dur,peak){
      var o=AC.createOscillator(), g=G(), lp=F('lowpass',f1*2,.3);
      o.frequency.setValueAtTime(f0,at); o.frequency.exponentialRampToValueAtTime(f1,at+dur*.6);
      g.gain.setValueAtTime(0,at); g.gain.linearRampToValueAtTime(peak,at+.025); g.gain.exponentialRampToValueAtTime(.0001,at+dur);
      o.connect(lp); lp.connect(g); g.connect(b); o.start(at); o.stop(at+dur+.05);
    }
    plop(t+.6,260,520,.36,.05);
    plop(t+.95,620,900,.18,.014);
    bell(b,t+.7,261.6,.045,.7);                            // the sustain that blooms out of the drop
  }},
  candle:{send:.3, play:function(b,t,T,E){
    var fl=F('lowpass',240,.4), fg=G(); loopSrc(pinkBuf,fl,t,t+3); fl.connect(fg); fg.connect(b);
    fg.gain.setValueAtTime(0,t+.45); fg.gain.setTargetAtTime(.22,t+.5,.14); fg.gain.setTargetAtTime(0,t+.95,.4);
    fl.frequency.setTargetAtTime(560,t+.5,.15); fl.frequency.setTargetAtTime(240,t+.95,.4);
    var rl=F('lowpass',190,.4), rg=G(); loopSrc(brownBuf,rl,t,E); rl.connect(rg); rg.connect(b);
    swell(rg.gain,t+.6,.07,3,t+T,1.5);
    for(var i=0;i<6;i++){
      var at=t+rnd(1.8,Math.max(2,T-.5)), cb=F('bandpass',rnd(1600,2600),.8), cl=F('lowpass',3000,.4), cg=G();
      loopSrc(pinkBuf,cb,at,at+.1); cb.connect(cl); cl.connect(cg); cg.connect(b);
      cg.gain.setValueAtTime(0,at); cg.gain.linearRampToValueAtTime(rnd(.03,.06),at+.006); cg.gain.exponentialRampToValueAtTime(.0001,at+.06);
    }
    var bl=F('lowpass',700,.4), bg=G(), bt=t+T+.05; loopSrc(pinkBuf,bl,bt,bt+1.2); bl.connect(bg); bg.connect(b);
    bg.gain.setValueAtTime(0,bt); bg.gain.setTargetAtTime(.12,bt,.07); bg.gain.setTargetAtTime(0,bt+.2,.2);
  }},
  drift:{send:.28, play:function(b,t,T,E){
    breeze(b,t,E).forEach(function(L){
      var base=L.k?.09:.17;
      L.g.gain.setTargetAtTime(base,t,1.3);
      for(var c=t+2.5;c<E;c+=2.6){
        L.g.gain.setTargetAtTime(base*rnd(.75,1.2),c,1.3);
        L.bp.frequency.setTargetAtTime(rnd(380,620),c,1.4);
        if(L.pan) L.pan.pan.setTargetAtTime((L.k?-1:1)*Math.sin((c-t)*.9)*.45,c,1);
      }
    });
    var rt=t+6.2, rb=F('bandpass',2100,.8), rl=F('lowpass',3400,.4), rg=G();
    loopSrc(pinkBuf,rb,rt,rt+.8); rb.connect(rl); rl.connect(rg); rg.connect(b);
    rg.gain.setValueAtTime(0,rt); rg.gain.setTargetAtTime(.06,rt,.05); rg.gain.setTargetAtTime(0,rt+.15,.1);
  }},
  stars:{send:.5, play:function(b,t,T,E){
    var p=[392,440,523.3,587.3], idx=[0,2,4,6];
    idx.forEach(function(si,i){
      var s=t+1.2+si*.3, o=AC.createOscillator(), g=G(), lp=F('lowpass',1400,.3);
      o.frequency.value=p[i];
      g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.022,s+.06); g.gain.exponentialRampToValueAtTime(.0001,s+4.2);
      o.connect(lp); lp.connect(g); g.connect(b); o.start(s); o.stop(s+4.3);
    });
  }}
};

var curBus=null;
/* T = seconds until the fade-out starts, O = length of the fade-out */
function playSound(look,T,O){
  if(!AC) return;
  var L=SOUNDS[look], t=AC.currentTime+.05, b=newBus(L.send); curBus=b;
  b.gain.setValueAtTime(1,t+T); b.gain.setTargetAtTime(0,t+T,O/3.2);   // sound finishes as the picture fades
  L.play(b,t,T,t+T+O+.5);
}
/* fade everything now (early dismiss) */
function fadeSound(sec){ if(curBus&&AC){ curBus.gain.cancelScheduledValues(AC.currentTime); curBus.gain.setTargetAtTime(0,AC.currentTime,sec/3.2); } }
function keepTick(){
  if(!AC) return;
  var b=newBus(.5), t=AC.currentTime, o=AC.createOscillator(), g=G();
  o.frequency.value=740; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.035,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.9);
  o.connect(g); g.connect(b); o.start(t); o.stop(t+1);
}
