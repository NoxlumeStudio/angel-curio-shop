/* Scene BGM is independent of the 90-day game save. */
const BGM = (() => {
  const FILES = Object.freeze({
    opening:'assets/audio/bgm_opening.ogg', shop:'assets/audio/bgm_shop.ogg',
    ending_01:'assets/audio/bgm_ending_01.ogg', ending_02:'assets/audio/bgm_ending_02.ogg',
    ending_03:'assets/audio/bgm_ending_03.ogg', ending_04:'assets/audio/bgm_ending_04.ogg'
  });
  const SETTING_KEY = 'angel-curio-shop-bgm-settings-v1';
  let settings = {enabled:true, volume:25};
  try {
    const saved = JSON.parse(localStorage.getItem(SETTING_KEY));
    if (typeof saved?.enabled === 'boolean') settings.enabled=saved.enabled;
    if (Number.isFinite(saved?.volume)) settings.volume=Math.max(0,Math.min(100,saved.volume));
  } catch {}
  let audio=null, current=null, fade=null, blocked=false, runToken=0;
  const level=()=>settings.enabled ? settings.volume/100 : 0;
  function cancelFade(){if(fade!==null){clearInterval(fade);fade=null;}}
  function fadeTo(target,duration,whenDone){
    cancelFade();if(!audio){whenDone?.();return;}
    const item=audio, from=item.volume, start=Date.now();
    if(!duration||from===target){item.volume=target;whenDone?.();return;}
    fade=setInterval(()=>{
      if(audio!==item){cancelFade();return;}
      const t=Math.min(1,(Date.now()-start)/duration);
      item.volume=Math.max(0,Math.min(1,from+(target-from)*t));
      if(t===1){cancelFade();whenDone?.();}
    },30);
  }
  function tryPlay(item,token){
    if(!settings.enabled || level()===0)return;
    try {const p=item.play();if(p?.catch)p.catch(()=>{if(audio===item&&runToken===token)blocked=true;});blocked=false;}
    catch {blocked=true;}
  }
  function play(key,opts={}){
    if(!FILES[key])return;
    const restart=!!opts.restart;
    if(current===key&&audio){
      if(restart){audio.currentTime=0;const token=++runToken;tryPlay(audio,token);}
      else if(blocked)tryPlay(audio,runToken);
      return;
    }
    cancelFade();if(audio){audio.pause();audio=null;}
    current=key;blocked=false;
    if(typeof Audio!=='function')return;
    try{
      audio=new Audio(FILES[key]);audio.loop=(key==='shop');audio.volume=0;
      const token=++runToken;
      tryPlay(audio,token);
      fadeTo(level(),800);
    }catch{audio=null;}
  }
  function stop(duration=0){
    const old=audio;current=null;blocked=false;++runToken;
    if(!old)return;
    cancelFade();
    if(duration>0)fadeTo(0,duration,()=>{old.pause();if(audio===old)audio=null;});
    else{old.pause();audio=null;}
  }
  function saveSettings(){try{localStorage.setItem(SETTING_KEY,JSON.stringify(settings));}catch{}}
  function setEnabled(enabled){settings.enabled=!!enabled;saveSettings();if(audio){cancelFade();if(settings.enabled){tryPlay(audio,runToken);fadeTo(level(),180);}else{audio.pause();audio.volume=0;}}}
  function setVolume(value){settings.volume=Math.max(0,Math.min(100,Number(value)||0));saveSettings();if(audio){cancelFade();audio.volume=level();if(settings.enabled&&settings.volume>0&&blocked)tryPlay(audio,runToken);}}
  function retry(){if(blocked&&audio)tryPlay(audio,runToken);}
  return {play,stop,retry,setEnabled,setVolume,getSettings:()=>({...settings}),getCurrent:()=>current};
})();
