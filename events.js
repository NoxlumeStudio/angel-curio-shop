// Small autumn shop incidents. This file contains only story data and event rules;
// the existing game owns inventory, money, customers, persistence and rendering.
const NORMAL_EVENTS={
 N01:{title:'値札の書き間違い',actor:'通りすがりの客',lines:[['リゼット','まあ！ 今日は開店前からお客様ですのね！'],['通りすがりの客','そりゃ、こんな値段なら買いたくもなるさ'],['リゼット','ふふん。当店の商品はどれもお買い得ですもの！'],['通りすがりの客','天使の羽根が10 Gとはな'],['リゼット','…………'],['リゼット','……じゅう？'],['通りすがりの客','値札、間違ってるんじゃないか？'],['リゼット','そ、そんなはず……あっ！！']],choices:[['A','すぐに値札を訂正する'],['B','お詫びに少し値引きする']]},
 N02:{title:'返品された羽根',actor:'客',lines:[['客','昨日買った羽根なんだが、返品したい'],['リゼット','まあ。お気に召しませんでしたの？'],['客','夜になると震えるんだ。しかも、誰かの名前を呼んでいる'],['リゼット','…………'],['リゼット','それは……ずいぶん珍しい品ですわね'],['客','珍しがってないで、どうにかしてくれ！']],choices:[['A','返品を受け付ける'],['B','返品を断る']]},
 N03:{title:'怪しい安売り商人',actor:'行商人',lines:[['行商人','お嬢さん、いい品があるぜ。天使の羽根を特別価格で譲ってやる'],['リゼット','まあ！ 私の才能を見込んでの特別待遇ですのね！'],['行商人','そうそう。あんたは見るからに大物だ'],['リゼット','おーっほっほ！ 分かる方には分かりますのね！'],['行商人','……で、どうする？']],choices:[['A','そのまま購入する'],['B','先に鑑定する'],['C','断る']]},
 N04:{title:'お得意様の紹介',actor:'常連客',lines:[['常連客','この店、最近評判がいいらしいな'],['リゼット','当然ですわ！ 店主がこの私ですもの！'],['常連客','知り合いにも紹介してやろうか？'],['リゼット','まあ！ よろしくてよ！'],['常連客','紹介客には何かサービスしてくれるんだろう？'],['リゼット','……えっ？']],choices:[['A','紹介客に割引する'],['B','通常価格で迎える']]},
 N05:{title:'壊れた薬瓶',actor:null,lines:[['リゼット','さて、本日も商品を美しく並べて……'],['地の文','カチャン。'],['リゼット','……あら？'],['リゼット','瓶に、ひびが……？'],['地の文','中の液体がゆっくりと漏れ始める。'],['リゼット','ちょ、ちょっと！ 勝手に減らないでくださいまし！']],choices:[['A','瓶を修理する'],['B','格安で処分販売する'],['C','廃棄する']]},
 N06:{title:'値切り上手の老婆',actor:'老婆',lines:[['老婆','お嬢ちゃん、この品をもう少し安くしておくれ'],['リゼット','まあ。こちらは由緒ある天使の珍品ですのよ？'],['老婆','年寄り相手にそんな値段を取るのかい？'],['リゼット','うっ……'],['老婆','少しくらい勉強しておくれよ'],['リゼット','べ、勉強なら天上で十分いたしましたわ！']],choices:[['A','値引きして売る'],['B','値引きを断る']]},
 N07:{title:'偽物の羽粉',actor:'行商人',lines:[['行商人','本物の天上の羽粉が手に入ったぜ'],['リゼット','まあ、本当ですの？'],['行商人','もちろん。ほら、この輝き！'],['リゼット','…………'],['リゼット','……妙ですわね。この粉、光の揺らぎが不自然ですわ'],['行商人','き、気のせいだろ！']],choices:[['A','安値なら買う'],['B','購入を断る']]},
 N08:{title:'雨の日の客足',actor:null,lines:[['地の文','店の窓を激しい雨が叩いている。'],['リゼット','……まったく、よく降りますこと'],['リゼット','こんなお天気では、お客様もいらっしゃいませんわね'],['リゼット','……いえ！ この程度の雨で商売を諦める私ではありませんわ！']],choices:[['A','臨時広告を出す'],['B','通常営業する']]},
 N09:{title:'迷子の小天使',actor:'翼のない子ども',lines:[['子ども','……あの'],['リゼット','まあ。どうなさいましたの？'],['子ども','帰る場所が分からなくて……'],['リゼット','…………'],['地の文','リゼットは子どもの背中に目を留める。そこには翼を失った痕跡があった。'],['リゼット','……そう。あなたも、なのね'],['子ども','……？'],['リゼット','こほん！ まずは温かいものでも召し上がりなさい！']],choices:[['A','食事を与え、保護先を探す'],['B','役所の保護窓口へ案内する']]},
 N10:{title:'競合店の値下げ',actor:'近隣商人',lines:[['近隣商人','向かいの店が大安売りを始めたぞ'],['リゼット','まあ！ ずいぶん品のない商売ですこと'],['近隣商人','客を取られるんじゃないか？'],['リゼット','ふふん！ この私に勝負を挑むというのですわね！']],choices:[['A','対抗して値下げする'],['B','品質で勝負する']]},
 N11:{title:'大口注文',actor:'貴族の使い',lines:[['使い','主人がこちらの品を二つ、お求めでございます'],['リゼット','まあ！ 大口のお客様ですのね！'],['使い','まとめ買いですので、少々お安くしていただけませんか？'],['リゼット','……お安く？'],['使い','ええ。今ここでお支払いします'],['リゼット','ふ、ふふん。商談とはこういうものですのね！']],choices:[['A','まとめ売りを受ける'],['B','通常価格を譲らない']]},
 N12:{title:'店の掃除',actor:null,lines:[['リゼット','……あら？'],['地の文','棚の上を指でなぞると、厚い埃がついた。'],['リゼット','な、何ですのこの埃は！？'],['リゼット','由緒ある骨董店が、これでは廃墟ではありませんの！'],['リゼット','……え？ 最初からこんな状態でした？']],choices:[['A','清掃業者を呼ぶ'],['B','自分で掃除する'],['C','放置する']]}
};
const NORMAL_EVENT_IDS=Object.keys(NORMAL_EVENTS);
const eventEffectsDefault=()=>({trafficToday:0,referralDiscountCount:0,discountAllToday:0,qualityChanceToday:0,cleaningFrom:0,cleaningUntil:0,dirtyDay:0,withheldEye:0});
function eventSaleCandidates(ids,need=1,displayOnly=false){return ids.flatMap(id=>{const p=product(id);return p&&tierUnlocked(p)&&qty(id)>=need&&(!displayOnly||displayed(id)>=need)?[p]:[];});}
function returnableFeathers(){return (state.salesHistory||[]).filter(x=>x.id==='feather'&&x.day<state.day&&!x.returned);}
function normalEventEligible(id){if(state.phase!=='prepare'||state.finished||state.day<3||state.eventsSeen?.includes(id))return false;switch(id){
 case'N01':return unlockedProducts().some(p=>displayed(p.id)>0&&state.prices[p.id]>20);
 case'N02':return returnableFeathers().length>0;
 case'N03':return state.day>=5&&state.cash>=300&&stock()<cap();
 case'N04':return (state.unitsSold||0)>=20;
 case'N05':return ['tear','blood','oil'].reduce((n,id)=>n+qty(id),0)>=2;
 case'N06':return state.day>=10&&displayStock()>0;
 case'N07':return (state.soldById?.dust||0)>=3&&state.cash>=100&&stock()<cap();
 case'N08':return state.day>=15;
 case'N09':return state.day>=20;
 case'N10':return state.sales>=5000;
 case'N11':return !!state.equipment.shelf&&eventSaleCandidates(['voice','halo_shard','oil'],2).length>0;
 case'N12':return state.day>=30;
 default:return false;
}}
function fixedStoryEventToday(){return [30,60,80].includes(state.day);}
function maybeStartNormalEvent(){if(state.phase!=='prepare'||state.finished||state.eventCheckedDay===state.day||state.activeEvent)return false;state.eventCheckedDay=state.day;if(fixedStoryEventToday()){return beginDebtEventForDay();}if(state.day>=10){const candidates=SPECIAL_EVENT_IDS.filter(specialEventEligible);if(candidates.length&&Math.random()<.08)return beginStoryEvent(candidates[rnd(0,candidates.length-1)]);}if(state.day<3)return false;const candidates=NORMAL_EVENT_IDS.filter(normalEventEligible);if(!candidates.length||Math.random()>=.20)return false;return beginNormalEvent(candidates[rnd(0,candidates.length-1)]);}
function beginNormalEvent(id,force=false){if(!NORMAL_EVENTS[id]||state.phase!=='prepare'||state.activeEvent||!force&&!normalEventEligible(id))return false;const ids={N01:unlockedProducts().filter(p=>displayed(p.id)>0&&state.prices[p.id]>20).map(p=>p.id),N05:eventSaleCandidates(['tear','blood','oil']).map(p=>p.id),N06:unlockedProducts().filter(p=>displayed(p.id)>0).map(p=>p.id),N11:eventSaleCandidates(['voice','halo_shard','oil'],2).map(p=>p.id)};const pool=ids[id]||[];const chosen=pool.includes('feather')?'feather':pool[0]||null;let historyId=null;if(id==='N02')historyId=returnableFeathers()[0]?.saleId||null;state.activeEvent={id,stage:'dialogue',line:0,chosen,historyId,quality:id==='N03'?randomQuality():null,summary:'',outcome:'',day:state.day};state.eventsSeen=state.eventsSeen||[];if(!state.eventsSeen.includes(id))state.eventsSeen.push(id);state.eventCheckedDay=state.day;tab='shop';save();render();return true;}
function normalEventNext(){const e=state.activeEvent;if(!e||!NORMAL_EVENTS[e.id])return;if(e.stage==='dialogue'){if(++e.line>=NORMAL_EVENTS[e.id].lines.length)e.stage='choice';}else if(e.stage==='result'){state.activeEvent=null;}save();render();}
function normalEventDisabled(id,choice){const e=state.activeEvent;if(!e||e.id!==id||e.stage!=='choice')return '選択できません';const price=state.prices[e.chosen]||0;switch(id+choice){
 case'N01B':return !e.chosen||displayed(e.chosen)<1||price<=20?'販売できる商品がありません':null;
 case'N02A':{const h=state.salesHistory.find(x=>x.saleId===e.historyId&&!x.returned);return !h?'返品対象がありません':state.cash<h.price?'返金する現金が不足しています':stock()>=cap()?'保管容量が不足しています':null;}
 case'N03A':return state.cash<60?'現金60 Gが必要':stock()>=cap()?'保管容量が不足しています':null;
 case'N03B':return state.cash<80?'鑑定と仕入れに80 Gの用意が必要':stock()>=cap()?'保管容量が不足しています':null;
 case'N05A':return state.cash<60?'修理費60 Gが不足しています':null;
 case'N06A':return !e.chosen||displayed(e.chosen)<1?'陳列商品がありません':null;
 case'N07A':return state.cash<40?'現金40 Gが不足しています':null;
 case'N08A':return state.cash<100?'広告費100 Gが不足しています':null;
 case'N09A':return state.cash<80?'食事代80 Gが不足しています':null;
 case'N11A':return !e.chosen||qty(e.chosen)<2?'対象在庫が不足しています':null;
 case'N12A':return state.cash<120?'清掃費120 Gが不足しています':null;
 default:return null;
}}
function eventOperatingCost(amount,why){state.cash-=amount;state.operatingExpense+=amount;record(`${why}：営業費用${fmt(amount)}`);}
function eventTakeLot(id){const lot=state.inventory.find(x=>x.id===id&&x.qty>0);if(!lot)return null;const shown=displayed(id),snapshot={id,quality:lot.quality,known:lot.known,cost:lot.cost};lot.qty--;state.inventory=state.inventory.filter(x=>x.qty>0);state.display[id]=Math.max(0,Math.min(qty(id),shown-1));return snapshot;}
function eventSell(id,unitPrice,count=1){const sold=[];for(let i=0;i<count;i++){const lot=eventTakeLot(id);if(!lot)break;const price=Math.max(1,Math.round(unitPrice));state.cash+=price;state.sales+=price;recordOutsideSale(price);state.cogs+=lot.cost;state.unitsSold++;state.soldById[id]=(state.soldById[id]||0)+1;const saleId=++state.saleSerial,boom=demandBoomFor();state.salesHistory.push({...lot,saleId,day:state.day,price,returned:false,event:true,popularAtSale:state.demand?.popularId===id,boomActiveAtSale:!!boom,boomAtSale:!!boom&&DEMAND_BOOMS[boom.id].ids.includes(id)});record(`事件で${product(id).name}を${fmt(price)}で販売（原価${fmt(lot.cost)}）${saleDemandLabel(id)}`);sold.push({price,cost:lot.cost});}return sold;}
function eventBuy(id,price,quality,known=false){state.cash-=price;const existing=state.inventory.find(x=>x.id===id&&x.cost===price&&x.quality===quality&&x.known===known);if(existing)existing.qty++;else state.inventory.push({id,cost:price,quality,known,qty:1});state.display[id]=(state.display[id]||0)+1;if(known)state.codex[id]=true;record(`事件で${product(id).name}を${fmt(price)}で仕入れ（品質${quality}）`);}
function normalEventChoose(choice){const e=state.activeEvent;if(!e||e.stage!=='choice'||!NORMAL_EVENTS[e.id].choices.some(x=>x[0]===choice))return false;const error=normalEventDisabled(e.id,choice);if(error)return false;const id=e.id,p=e.chosen?product(e.chosen):null;let summary='変動なし',reply='';
 switch(id+choice){
 case'N01A':reply='こ、これは特別なお客様への試験でしたの！';break;
 case'N01B':{const sold=eventSell(e.chosen,state.prices[e.chosen]-20);summary=`売上＋${fmt(sold[0].price)}／在庫−1点`;reply='本日は特別価格ですわ！ 次からは通常価格でしてよ！';break;}
 case'N02A':{const h=state.salesHistory.find(x=>x.saleId===e.historyId&&!x.returned);h.returned=true;state.cash-=h.price;state.sales-=h.price;recordOutsideSale(-h.price);state.cogs-=h.cost;state.unitsSold=Math.max(0,state.unitsSold-1);state.soldById.feather=Math.max(0,(state.soldById.feather||0)-1);state.inventory.push({id:'feather',cost:h.cost,quality:h.quality,known:h.known,qty:1});state.display.feather=(state.display.feather||0)+1;record(`羽根の返品：返金${fmt(h.price)}、原価${fmt(h.cost)}を戻し`);summary=`現金−${fmt(h.price)}／羽根在庫＋1点／売上・原価取消`;reply='し、仕方ありませんわね。特別に返品を承ります';break;}
 case'N02B':reply='当店では、商品の夜間の言動までは保証しておりませんの！';summary='取引なし。客「言動って言ったな、今！」';break;
 case'N03A':eventBuy('feather',60,e.quality);summary='現金−60 G／羽根在庫＋1点（未鑑定）';reply='ふふん！ これぞ商人としての交渉力ですわ！';break;
 case'N03B':state.cash-=20;state.fees+=20;record('安売り羽根を特別鑑定：20 G');if(e.quality==='A'||e.quality==='B'){eventBuy('feather',60,e.quality,true);summary=`鑑定費−20 G／仕入れ−60 G／品質${e.quality}の羽根＋1点`;}else summary='鑑定費−20 G／品質Cにつき購入見送り';reply='私を騙そうなんて、百年早いですわ！';break;
 case'N03C':reply='安すぎる品には裏があるものですわ。……たぶん！';break;
 case'N04A':state.eventEffects.trafficToday+=2;state.eventEffects.referralDiscountCount=2;summary='本日の紹介客＋2人／紹介客のみ価格10％引き';reply='こ、これも将来への投資ですわ！';break;
 case'N04B':state.eventEffects.trafficToday+=1;summary='本日の来客候補＋1人';reply='当店の品質をご覧になれば、価格にもご納得いただけますわ！';break;
 case'N05A':eventOperatingCost(60,'壊れた薬瓶の修理');summary='現金−60 G／在庫維持';reply='ふう……危うく貴重な商品を失うところでしたわ';break;
 case'N05B':{const sold=eventSell(e.chosen,Math.round(state.prices[e.chosen]*.6));summary=`訳あり売上＋${fmt(sold[0].price)}／在庫−1点`;reply='本日限定の訳あり品ですわ！ 品質は……たぶん大丈夫ですの！';break;}
 case'N05C':{const lot=eventTakeLot(e.chosen);state.wasteLoss+=lot.cost;record(`${p.name}を廃棄：廃棄損${fmt(lot.cost)}`);summary=`在庫−1点／廃棄損${fmt(lot.cost)}`;reply='……商品は大切に扱わなければいけませんわね';break;}
 case'N06A':{const sold=eventSell(e.chosen,Math.round(state.prices[e.chosen]*.8));summary=`売上＋${fmt(sold[0].price)}／在庫−1点`;reply='今回だけですわよ！ 本当に今回だけですからね！';break;}
 case'N06B':summary='取引なし。老婆「ふん、なかなか強情な娘だね」';reply='商売は慈善事業ではありませんの！';break;
 case'N07A':state.cash-=40;state.cash+=50;state.sales+=50;recordOutsideSale(50);state.cogs+=40;record('偽物の羽粉を40 Gで購入し50 Gで即時転売');summary='40 Gで購入し50 Gで転売／差益＋10 G（通常在庫に追加なし）';reply='偽物にも使い道はありますもの！';break;
 case'N07B':reply='私の鑑定眼を甘く見ないことですわ！';break;
 case'N08A':eventOperatingCost(100,'雨の日の臨時広告');summary='現金−100 G／本日の来客数は通常どおり';reply='雨の日こそ宣伝の好機ですわ！';break;
 case'N08B':state.eventEffects.trafficToday-=1;summary='本日の来客候補−1人';reply='今日は静かにお客様をお待ちしましょう';break;
 case'N09A':eventOperatingCost(80,'子どもの食事と保護先探し');state.eventEffects.trafficToday+=1;summary='現金−80 G／本日の来客候補＋1人／子どもは保護先へ';reply='か、勘違いなさらないで！ 店先で倒れられては困りますもの！';break;
 case'N09B':summary='子どもは役所の保護窓口へ向かった';reply='道は教えて差し上げます。……ひとりで行けますの？';break;
 case'N10A':state.eventEffects.discountAllToday=.9;state.eventEffects.trafficToday+=2;summary='本日全品10％引き／来客候補＋2人';reply='価格で勝負というなら、受けて立ちますわ！';break;
 case'N10B':state.eventEffects.qualityChanceToday=.05;summary='本日、鑑定済み商品の購入率＋5ポイント（上限95％）';reply='真の価値が分かるお客様だけ、お越しになればよろしいのですわ！';break;
 case'N11A':{const sold=eventSell(e.chosen,Math.round(state.prices[e.chosen]*.9),2);summary=`売上＋${fmt(sold.reduce((n,x)=>n+x.price,0))}／在庫−2点`;reply='二点まとめてお買い上げ！ ありがとうございますわ！';break;}
 case'N11B':summary='取引不成立';reply='当店の逸品に、安売りの必要はありませんもの！';break;
 case'N12A':eventOperatingCost(120,'清掃業者');state.eventEffects.cleaningFrom=state.day+1;state.eventEffects.cleaningUntil=state.day+3;summary='現金−120 G／翌日から3営業日、来客候補＋1人';reply='おーっほっほ！ 見違えるほど美しくなりましたわ！';break;
 case'N12B':state.eventEffects.trafficToday-=1;summary='本日の来客候補−1人';reply='こ、この私が雑巾を持つ日が来るなんて……！';break;
 case'N12C':state.eventEffects.dirtyDay=state.day+1;summary='翌日の来客候補−1人';reply='骨董店には、多少の埃も風情というものですわ！';break;
 }
 e.stage='result';e.outcome=reply;e.summary=summary;record(`通常イベント${id}：${NORMAL_EVENTS[id].title}／選択${choice}／${summary}`);save();render();return true;
}
function dailyEventTraffic(){const f=state.eventEffects||eventEffectsDefault();return (f.trafficToday||0)+(state.day>=f.cleaningFrom&&state.day<=f.cleaningUntil?1:0)-(f.dirtyDay===state.day?1:0);}
function normalEventUi(){const e=state.activeEvent,def=e&&NORMAL_EVENTS[e.id];if(!def)return null;if(e.stage==='dialogue'){let [speaker,txt]=def.lines[e.line];if(e.id==='N01'&&e.chosen&&e.chosen!=='feather')txt=txt.replace('天使の羽根',product(e.chosen).name);return {speaker,text:txt,speakerKind:speaker!=='リゼット'&&speaker!=='地の文'?'customer':'lisette',mood:speaker==='リゼット'?'surprised':'proud',buttons:`<button class="intro-tail-button dialogue-next" data-normal-next>次へ ▸</button>`};}if(e.stage==='result')return {speaker:'リゼット',text:e.outcome+'　'+e.summary,mood:'happy',buttons:'<button class="intro-tail-button dialogue-next" data-normal-next>確認して戻る ▸</button>'};return {speaker:'リゼット',text:`『${def.title}』どうなさいますか？`,mood:'worried',buttons:`<div class="normal-event-actions">${def.choices.map(([key,label])=>{const reason=normalEventDisabled(e.id,key);return `<button class="btn small" data-normal-choice="${key}" ${reason?'disabled':''} title="${escapeHtml(reason||label)}">${escapeHtml(label)}${reason?`（${escapeHtml(reason)}）`:''}</button>`;}).join('')}</div>`};}
// Manual testing only: ?debugEvents=1 exposes window.debugNormalEvent('N01').
if(typeof window!=='undefined'&&window.location?.search?.includes('debugEvents=1'))window.debugNormalEvent=id=>beginNormalEvent(id,true);
