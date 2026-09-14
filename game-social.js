const encode=value=>Array.from(new TextEncoder().encode(String(value)),b=>b.toString(16).padStart(2,'0')).join('');
const gameKey=game=>encode(game.id??game.url);
let votes={},favorites=new Set(),account='',api=null,stop=null;
const pending=new Set();
const section=document.createElement('section');section.className='game-favorites';section.innerHTML='<header><div><span>MADE FOR YOU</span><h2>Your Favorites</h2></div><small>Keep your next game close.</small></header><div class="favorites-games"></div><p class="favorites-empty">Tap the star on a game to save it here.</p>';
const notice=document.createElement('p');notice.className='game-social-notice';notice.setAttribute('role','status');
const storageKey=()=> 'nova_game_favorites_'+encode(account||'guest');
function loadFavorites(){try{const value=JSON.parse(localStorage.getItem(storageKey())||'[]');favorites=new Set(Array.isArray(value)?value:[]);}catch{favorites=new Set();}}
function rating(key){const entries=Object.values(votes[key]||{});return {likes:entries.filter(v=>v===1).length,dislikes:entries.filter(v=>v===-1).length,mine:votes[key]?.[encode(account)]};}
function decorate(card){
 if(card.querySelector('.game-social'))return;
 const key=encode(card.dataset.gameId),bar=document.createElement('div');bar.className='game-social';
 for(const [action,icon,label] of [['like','♡','Like'],['dislike','−','Dislike'],['favorite','☆','Favorite']]){
  const button=document.createElement('button');button.type='button';button.dataset.action=action;button.title=label;button.setAttribute('aria-label',label);button.innerHTML='<span aria-hidden="true">'+icon+'</span><span data-count></span>';
  if(action!=='favorite')button.firstElementChild.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'+(action==='dislike'?' style="transform:rotate(180deg)"':'')+'><path d="M7 10v10H3V10h4zm0 0 5-7c3 0 2 4 1 7h5a2 2 0 0 1 2 2l-2 8H7"/></svg>';
  button.onclick=async event=>{event.stopPropagation();if(pending.has(key))return;
   if(action==='favorite'){
    const next=new Set(favorites);if(next.has(key))next.delete(key);else next.add(key);
    try{localStorage.setItem(storageKey(),JSON.stringify([...next]));favorites=next;paint();renderFavorites();}catch{notice.textContent='Could not save favorites. Browser storage is unavailable.';}return;
   }
   if(!api||!account||account==='Guest'){notice.textContent='Sign in to Nova to rate games.';return;}
   pending.add(key);paint();notice.textContent='';
   try{const value=action==='like'?1:-1;await api.backend.write('novaGameVotes/'+key+'/'+encode(account),rating(key).mine===value?null:value);}
   catch{notice.textContent='Could not save your rating. Please try again.';}
   finally{pending.delete(key);paint();}
  };bar.append(button);
 }
 card.append(bar);card.classList.add('has-game-social');
}
function paint(){document.querySelectorAll('.game-card[data-game-id]').forEach(card=>{
 decorate(card);const key=encode(card.dataset.gameId),value=rating(key);
 for(const button of card.querySelectorAll('.game-social button')){const action=button.dataset.action,selected=action==='favorite'?favorites.has(key):value.mine===(action==='like'?1:-1);button.setAttribute('aria-pressed',String(selected));button.disabled=pending.has(key);button.querySelector('[data-count]').textContent=action==='favorite'?'':String(action==='like'?value.likes:value.dislikes);if(action==='favorite')button.firstElementChild.textContent=selected?'★':'☆';}
});}
function renderFavorites(){const library=window.NovaGameLibrary;if(!library)return;const grid=section.querySelector('.favorites-games');grid.replaceChildren();for(const game of library.games.filter(game=>favorites.has(gameKey(game)))){const card=library.createCard(game);const image=card.querySelector('img');if(image){image.onload=()=>image.classList.add('loaded');image.src=image.dataset.src;}grid.append(card);}section.querySelector('.favorites-empty').hidden=!!grid.children.length;paint();}
function libraryChanged(){const grid=document.getElementById('gameGrid');if(!grid)return;if(!section.isConnected){grid.before(section);section.after(notice);}paint();renderFavorites();}
window.addEventListener('nova-games-rendered',libraryChanged);
window.addEventListener('storage',event=>{if(event.key===storageKey()){loadFavorites();renderFavorites();}});
let connected=false;
function connect(){const service=window.NovaCommunity;if(!service)return;const name=service.state().name||'';if(connected&&name===account)return;connected=true;api=service;account=name;loadFavorites();stop?.();stop=api.backend.subscribe('novaGameVotes',value=>{votes=value||{};paint();},()=>{notice.textContent='Live ratings are unavailable right now.';});libraryChanged();}
let timer=setInterval(connect,500);connect();libraryChanged();
window.addEventListener('pagehide',()=>{clearInterval(timer);stop?.();});

window.addEventListener('pageshow',event=>{if(event.persisted){connected=false;timer=setInterval(connect,500);connect();}});
