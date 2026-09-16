import {getApps,initializeApp,cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getDatabase} from 'firebase-admin/database';
export const owner=uid=>(process.env.NOVA_OWNER_UIDS||'').split(',').map(s=>s.trim()).includes(uid);
export const validAccount=s=>typeof s==='string'&&s.length>0&&s.length<=100&&!/[.#$\[\]/]/.test(s);
export async function protectedRules(db){
 const rules=JSON.parse((await db.getRules()).source).rules;
 const denied=node=>Object.entries(node||{}).every(([key,value])=>['.read','.write'].includes(key)?value===false:!value||typeof value!=='object'||denied(value));
 const privateRoots=['novaSecureAccounts','novaSecureAppeals','novaVoice','novaVoiceInvites'];
 if(rules['.read']!==false||rules['.write']!==false||Object.entries(rules).some(([key,value])=>key.startsWith('$')&&!denied(value))||privateRoots.some(key=>rules[key]?.['.read']!==false||rules[key]?.['.write']!==false||!denied(rules[key])))throw Error('Publish the supplied firebase-voice.rules.json in Firebase Realtime Database → Rules first.');
}
export async function services(checkRules=true){
 if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)throw Error('Add FIREBASE_SERVICE_ACCOUNT_JSON to Production in Vercel, then redeploy.');
 const app=getApps().find(a=>a.name==='nova-voice')||initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),databaseURL:'https://nova-chat-43a18-default-rtdb.firebaseio.com'},'nova-voice');
 const db=getDatabase(app);if(checkRules)await protectedRules(db);return {db,auth:getAuth(app)};
}
