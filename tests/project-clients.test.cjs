const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createApp}=require('../server/app.cjs');
test('Project clients persist, validate, follow renames and protect linked clients',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'crm-project-'));const {app,db}=createApp(path.join(dir,'db.sqlite'));const server=app.listen(0);await new Promise(r=>server.once('listening',r));let cookie;
 async function req(route,method='GET',body){const r=await fetch('http://127.0.0.1:'+server.address().port+'/api'+route,{method,headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data}}
 try{
 await req('/login','POST',{username:'owner',password:'Owner@12345',role:'owner'});
 const a=(await req('/records/clients','POST',{name:'Client Alpha'})).data.id,b=(await req('/records/clients','POST',{name:'Client Beta'})).data.id;
 const clients=(await req('/records/clients')).data;assert(clients.some(c=>c.id===a));assert(clients.some(c=>c.id===b));
 assert.equal((await req('/records/projects','POST',{name:'Missing Client'})).status,400);
 const p=(await req('/records/projects','POST',{name:'New Project',clientId:a})).data.id;assert(p);
 assert.equal(db.prepare('SELECT clientId FROM records WHERE id=?').get(p).clientId,a);
 assert.equal((await req('/records/projects/'+p,'PUT',{name:'New Project',clientId:p})).status,400);
 assert.equal((await req('/records/clients/'+a,'DELETE')).status,400);
 assert.equal((await req('/records/clients/'+a,'PUT',{name:'Renamed Alpha'})).status,200);
 assert.equal((await req('/records/projects')).data.find(r=>r.id===p).clientName,'Renamed Alpha');
 assert.equal((await req('/records/projects/'+p,'PUT',{name:'New Project',clientId:b})).status,200);
 assert.equal((await req('/records/clients/'+a,'DELETE')).status,200);
 assert.equal(db.prepare('SELECT clientId FROM records WHERE id=?').get(p).clientId,b);
 assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{await new Promise(r=>server.close(r));db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
