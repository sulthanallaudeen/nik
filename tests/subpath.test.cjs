const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createApp}=require('../server/app.cjs');

test('subpath cookie is scoped and proxy origin checks remain active',async()=>{
 const previous=process.env.APP_BASE_HREF;
 process.env.APP_BASE_HREF='/crm/';
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'crm-subpath-'));
 let server,db;
 try{
  ({app:server,db}=createApp(path.join(dir,'db.sqlite')));
  const listener=server.listen(0,'127.0.0.1');
  await new Promise(resolve=>listener.once('listening',resolve));
  try{
   const base='http://127.0.0.1:'+listener.address().port+'/api/';
   const headers={Origin:'https://127.0.0.1:'+listener.address().port,'X-Forwarded-Proto':'https','Content-Type':'application/json'};
   const login=await fetch(base+'login',{method:'POST',headers,body:JSON.stringify({username:'owner',password:'Owner@12345',role:'owner'})});
   assert.equal(login.status,200);
   const cookie=login.headers.get('set-cookie');
   assert.match(cookie,/Path=\/crm\//);
   assert.match(cookie,/Secure/);
   const denied=await fetch(base+'logout',{method:'POST',headers:{...headers,Origin:'https://other.example.test',Cookie:cookie.split(';')[0]}});
   assert.equal(denied.status,403);
   const logout=await fetch(base+'logout',{method:'POST',headers:{...headers,Cookie:cookie.split(';')[0]}});
   assert.equal(logout.status,200);
   assert.match(logout.headers.get('set-cookie'),/Path=\/crm\//);
  }finally{await new Promise(resolve=>listener.close(resolve))}
 }finally{db?.close();fs.rmSync(dir,{recursive:true,force:true});if(previous===undefined)delete process.env.APP_BASE_HREF;else process.env.APP_BASE_HREF=previous}
});
