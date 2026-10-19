import {CASES} from './cases';
import {REFERENCES} from './references';
import {makeId,projectBodySchema} from './model';
const KEY='lady-today-buying-v1';
function fresh(){return {canEdit:true,projects:CASES.map(data=>({data:structuredClone(data),revision:1})),trends:structuredClone(REFERENCES),docs:[],updates:[],settings:{trendSchedule:false,queueSchedule:false},versions:[]};}
function read():any{const raw=localStorage.getItem(KEY);if(!raw)return fresh();try{return JSON.parse(raw);}catch{throw Error('本地数据无法读取。请保留浏览器数据并从JSON备份恢复。');}}
function write(d:any){try{localStorage.setItem(KEY,JSON.stringify(d));}catch{throw Error('浏览器存储已满或不可用，请先导出项目备份。');}}
export async function request<T=any>(url:string,b?:any):Promise<T>{
 const d=read(),u=new URL(url,location.origin),id=u.searchParams.get('projectId'),vid=u.searchParams.get('versionId');
 if(!b){if(vid){const v=d.versions.find((v:any)=>v.id===vid&&v.projectId===id);if(!v)throw Error('找不到版本');return structuredClone(v.data);}if(id)return {...d.projects.find((r:any)=>r.data.id===id),versions:d.versions.filter((v:any)=>v.projectId===id).map(({data,...v}:any)=>v)};return structuredClone(d);}
 let result:any={ok:true};
 const snap=(p:any,label:string)=>d.versions.unshift({id:makeId(),projectId:p.id,label,createdAt:new Date().toISOString(),data:structuredClone(p)});
 if(b.action==='save'){const p=projectBodySchema.parse({...b.project,updatedAt:new Date().toISOString()}),old=d.projects.find((r:any)=>r.data.id===p.id);if((old?.revision??0)!==b.revision)throw Error('另一个窗口已更新，请重新载入后再保存。');result={data:p,revision:b.revision+1};d.projects=d.projects.filter((r:any)=>r.data.id!==p.id);d.projects.unshift(result);}
 else if(b.action==='favorite'){const t=d.trends.find((t:any)=>t.id===b.id);if(t)t.saved=b.saved;}
 else if(b.action==='seed'){for(const p of CASES)if(!d.projects.some((r:any)=>r.data.id===p.id))d.projects.push({data:structuredClone(p),revision:1});for(const t of REFERENCES)if(!d.trends.some((x:any)=>x.id===t.id))d.trends.push(structuredClone(t));}
 else if(b.name==='write_trend_update'){for(const t of b.args.items)d.trends.unshift(t);d.updates.unshift(b.args.run);}
 else if(['snapshot','restore','archive'].includes(b.action)){const r=d.projects.find((r:any)=>r.data.id===b.id);if(!r)throw Error('项目不存在');if(r.revision!==b.revision)throw Error('项目已更新，请重新载入');if(b.action==='snapshot')snap(r.data,'手动保存');if(b.action==='restore'){const v=d.versions.find((v:any)=>v.id===b.versionId&&v.projectId===b.id);if(!v)throw Error('版本不存在');snap(r.data,'恢复前备份');r.data=structuredClone(v.data);r.data.status='草稿';r.revision++;result=r;}if(b.action==='archive'){snap(r.data,'归档备份');r.data.status='已归档';r.revision++;result=r;}}
 else throw Error('简版暂不支持这个操作');write(d);return structuredClone(result);
}
function db():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('lt-buying-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('浏览器无法保存附件'));});}
export async function uploadLocal(file:File,projectId=''){if(file.size>20*1024*1024)throw Error('每份资料请小于20MB');const id=makeId(),b=await db();await new Promise<void>((resolve,reject)=>{const t=b.transaction('files','readwrite');t.objectStore('files').put(file,id);t.oncomplete=()=>resolve();t.onerror=()=>reject(Error('附件保存失败'));});b.close();const d=read();d.docs.unshift({id,name:file.name,size:file.size,projectId,createdAt:new Date().toISOString(),extractionStatus:'本机原件 · 待识别'});write(d);}
export async function downloadLocal(id:string){const b=await db();const file=await new Promise<File>((resolve,reject)=>{const r=b.transaction('files').objectStore('files').get(id);r.onsuccess=()=>r.result?resolve(r.result):reject(Error('本机未找到附件'));r.onerror=()=>reject(Error('读取失败'));});b.close();const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);}
