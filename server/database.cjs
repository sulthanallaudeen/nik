const {DatabaseSync}=require('node:sqlite');
const {scryptSync,randomBytes,timingSafeEqual}=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
function hash(password){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex')}
function verify(password,value){const [salt,h]=value.split(':');const a=scryptSync(password,salt,64),b=Buffer.from(h,'hex');return a.length===b.length&&timingSafeEqual(a,b)}
function openDatabase(file){fs.mkdirSync(path.dirname(file),{recursive:true});const db=new DatabaseSync(file);db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,username TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('user','tl','owner')),team TEXT NOT NULL,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY,name TEXT NOT NULL,mobile TEXT NOT NULL,email TEXT DEFAULT '',address TEXT DEFAULT '',source TEXT DEFAULT '',status TEXT DEFAULT 'New',ownerId INTEGER REFERENCES users(id),created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities(id INTEGER PRIMARY KEY,leadId INTEGER REFERENCES leads(id) ON DELETE CASCADE,userId INTEGER REFERENCES users(id),type TEXT,subtype TEXT,disposition TEXT,notes TEXT,followup TEXT,created TEXT);
CREATE TABLE IF NOT EXISTS calls(id INTEGER PRIMARY KEY,leadId INTEGER REFERENCES leads(id) ON DELETE SET NULL,userId INTEGER REFERENCES users(id),direction TEXT,status TEXT,duration INTEGER DEFAULT 0,recording TEXT DEFAULT '',created TEXT);
CREATE TABLE IF NOT EXISTS records(id INTEGER PRIMARY KEY,kind TEXT NOT NULL,name TEXT NOT NULL,description TEXT DEFAULT '',status TEXT DEFAULT 'Draft',team TEXT DEFAULT '',created TEXT);
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId INTEGER REFERENCES users(id),expires INTEGER);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,userId INTEGER,action TEXT,created TEXT);`);
db.exec(`CREATE TABLE IF NOT EXISTS campaign_audio(campaignId INTEGER PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,name TEXT,mime TEXT,data BLOB)`);
db.exec(`CREATE TABLE IF NOT EXISTS user_preferences(userId INTEGER PRIMARY KEY REFERENCES users(id),status TEXT DEFAULT 'Online',layout TEXT DEFAULT 'vertical',updated TEXT)`);
if(!db.prepare('PRAGMA table_info(records)').all().some(c=>c.name==='clientId'))db.exec('ALTER TABLE records ADD COLUMN clientId INTEGER REFERENCES records(id) ON DELETE RESTRICT');
db.exec('CREATE INDEX IF NOT EXISTS idx_records_client ON records(clientId)');
// Additive migration keeps records from earlier CRM editions.
for(const [name,type] of Object.entries({altMobile:"TEXT DEFAULT ''",hiddenSource:"TEXT DEFAULT ''",latestServices:"TEXT DEFAULT ''"})) {
 if(!db.prepare('PRAGMA table_info(leads)').all().some(c=>c.name===name))db.exec(`ALTER TABLE leads ADD COLUMN ${name} ${type}`);
}
if(!db.prepare('PRAGMA table_info(activities)').all().some(c=>c.name==='service'))db.exec("ALTER TABLE activities ADD COLUMN service TEXT DEFAULT ''");
db.exec(`CREATE TABLE IF NOT EXISTS voices(id INTEGER PRIMARY KEY,leadId INTEGER REFERENCES leads(id) ON DELETE CASCADE,userId INTEGER REFERENCES users(id),name TEXT,mime TEXT,data BLOB,created TEXT)`);

for(const [table,cols] of Object.entries({leads:{deletedAt:"TEXT DEFAULT ''",deletedBy:'INTEGER',project:"TEXT DEFAULT ''",location:"TEXT DEFAULT ''",budget:"TEXT DEFAULT ''",propertyType:"TEXT DEFAULT ''"},users:{email:"TEXT DEFAULT ''",extension:"TEXT DEFAULT ''",callingType:"TEXT DEFAULT 'Manual'",roleProfileId:'INTEGER'},records:{targetGroup:'INTEGER',ownerId:'INTEGER',meta:"TEXT DEFAULT '{}'"},calls:{campaignId:'INTEGER'}}))for(const [name,type] of Object.entries(cols)){if(!db.prepare(`PRAGMA table_info(${table})`).all().some(c=>c.name===name))db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`)}
db.exec(`CREATE TABLE IF NOT EXISTS group_members(groupId INTEGER REFERENCES records(id) ON DELETE CASCADE,userId INTEGER REFERENCES users(id),PRIMARY KEY(groupId,userId));
CREATE TABLE IF NOT EXISTS campaign_leads(campaignId INTEGER REFERENCES records(id) ON DELETE CASCADE,leadId INTEGER REFERENCES leads(id) ON DELETE CASCADE,PRIMARY KEY(campaignId,leadId));
CREATE TABLE IF NOT EXISTS campaign_replies(campaignId INTEGER REFERENCES records(id) ON DELETE CASCADE,userId INTEGER REFERENCES users(id),response TEXT,created TEXT,PRIMARY KEY(campaignId,userId));
CREATE TABLE IF NOT EXISTS user_logs(id INTEGER PRIMARY KEY,userId INTEGER REFERENCES users(id),session TEXT,status TEXT,started TEXT,ended TEXT,device TEXT,ip TEXT);
CREATE TABLE IF NOT EXISTS download_logs(id INTEGER PRIMARY KEY,userId INTEGER REFERENCES users(id),module TEXT,rows INTEGER,created TEXT);`);
if(!db.prepare('SELECT id FROM users LIMIT 1').get()){
const ins=db.prepare('INSERT INTO users(name,username,password,role,team) VALUES(?,?,?,?,?)');
ins.run('Priya Owner','owner',hash('Owner@12345'),'owner','All');ins.run('Jasmine Team Leader','tl',hash('Team@12345'),'tl','Sales A');ins.run('Shalini Agent','user',hash('User@12345'),'user','Sales A');ins.run('Dhivya Agent','agent2',hash('User@12345'),'user','Sales B');
const lead=db.prepare('INSERT INTO leads(name,mobile,email,address,source,status,ownerId,created) VALUES(?,?,?,?,?,?,?,?)');
['Barani Kumar','Kavitha','Ramesh','Anitha','Suresh','Deepa','Karthik','Meena','Vijay','Divya','Arun','Lakshmi'].forEach((n,i)=>lead.run(n,'90000000'+String(i+10),'demo'+i+'@example.com','Bengaluru','Website enquiry',['New','Interested','Follow-up','Not interested'][i%4],i%4===0?4:3,new Date().toISOString()));
const rec=db.prepare('INSERT INTO records(kind,name,description,status,team,created) VALUES(?,?,?,?,?,?)');
for(const [kind,names] of Object.entries({campaigns:['October property enquiries','September follow-ups'],obd:['Property launch announcement'],groups:['Sales A','Sales B'],locations:['Bengaluru','Chennai','Coimbatore'],sources:['Website enquiry','Walk-in','Referral'],dispositions:['Interested','Follow-up','Not interested','Not connected']})) for(const name of names)rec.run(kind,name,'Sample record','Draft','Sales A',new Date().toISOString());
db.prepare('INSERT INTO settings VALUES(1,?)').run(JSON.stringify({company:'Nikhand',allowClickToCall:false,extension:'',providerUrl:''}));
}
for(const g of db.prepare("SELECT * FROM records WHERE kind='groups'").all()) {
 if(!JSON.parse(g.meta||'{}').groupInitialized) for(const u of db.prepare('SELECT id FROM users WHERE team=?').all(g.name))db.prepare('INSERT OR IGNORE INTO group_members VALUES(?,?)').run(g.id,u.id);
 db.prepare('UPDATE records SET meta=? WHERE id=?').run(JSON.stringify({...JSON.parse(g.meta||'{}'),groupInitialized:true}),g.id);
}
for(const [kind,names] of Object.entries({budgets:['Below 50 lakh','50 lakh – 1 crore'],propertytypes:['Apartment','Villa','Plot'],clients:['Nikhand'],projects:['Property enquiries'],subcalltypes:['RNR','Call waiting','Not Interested','Incoming Barred','Interested Other Location','Voice not reach','Call Back','Interested','Switch off \ Not Reachable','Number Busy']}))if(!db.prepare('SELECT id FROM records WHERE kind=? LIMIT 1').get(kind))for(const name of names)db.prepare('INSERT INTO records(kind,name,description,status,team,created) VALUES(?,?,?,?,?,?)').run(kind,name,'','Active','',new Date().toISOString());
if(!db.prepare("SELECT id FROM records WHERE kind='roles' LIMIT 1").get())for(const [name,baseRole] of [['Admin','owner'],['Manager','tl'],['Team Leader','tl'],['User','user'],['Client','user'],['QC','user'],['Vendor','user']])db.prepare('INSERT INTO records(kind,name,status,created,meta) VALUES(?,?,?,?,?)').run('roles',name,'Active',new Date().toISOString(),JSON.stringify({baseRole,callAllowed:true}));
// Add clearly labelled local OBD examples once, including existing databases.
const demoSettings=JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get()?.value||'{}');
if(!demoSettings.dummyObdSeeded){
 const owner=db.prepare("SELECT id FROM users WHERE role='owner' AND active=1 ORDER BY id LIMIT 1").get();
 const team=db.prepare("SELECT team FROM users WHERE role='tl' AND active=1 ORDER BY id LIMIT 1").get()?.team||'Sales A';
 for(const [name,status,csv,voice] of [['Dummy — Property Launch','Ready','dummy-property-launch.csv','dummy-launch-audio.wav'],['Dummy — Follow-up Campaign','Stopped','dummy-follow-ups.csv','dummy-follow-up-audio.wav'],['Dummy — Site Visit Invitation','Ready','dummy-site-visits.csv','dummy-invitation-audio.wav']]){
  const meta={dummy:true,maxAttempts:1,csvName:csv,voiceReference:voice,scheduled:'',...(status==='Stopped'?{stoppedAt:new Date().toISOString()}:{})};
  const result=db.prepare('INSERT INTO records(kind,name,description,status,team,created,ownerId,meta) VALUES(?,?,?,?,?,?,?,?)').run('obd',name,'Dummy campaign for testing local Start and Stop. No live calls or audio delivery.',status,team,new Date().toISOString(),owner?.id||null,JSON.stringify(meta));
  const id=Number(result.lastInsertRowid);
  db.prepare("INSERT OR IGNORE INTO campaign_leads(campaignId,leadId) SELECT ?,l.id FROM leads l JOIN users u ON u.id=l.ownerId WHERE u.team=? AND COALESCE(l.deletedAt,'')='' LIMIT 5").run(id,team);
 }
 demoSettings.dummyObdSeeded=true;
 db.prepare('UPDATE settings SET value=? WHERE id=1').run(JSON.stringify(demoSettings));
}
const adminExamples=JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get()?.value||'{}');
if(!adminExamples.dummyAdminSeeded){
 const stamp=new Date().toISOString();
 for(const name of ['Dummy Sales Role','Dummy QC Role'])db.prepare('INSERT INTO records(kind,name,description,status,team,created,meta) VALUES(?,?,?,?,?,?,?)').run('roles',name,'Sample role with User scope only','Active','',stamp,JSON.stringify({baseRole:'user',callAllowed:false,dummy:true}));
 for(const name of ['Dummy Mobile Calling','Dummy Extension Calling'])db.prepare('INSERT INTO records(kind,name,description,status,team,created,meta) VALUES(?,?,?,?,?,?,?)').run('configs',name,'Example configuration — no live provider connected','Draft','',stamp,JSON.stringify({dummy:true,providerUrl:'https://example.invalid/call'}));
 adminExamples.dummyAdminSeeded=true;db.prepare('UPDATE settings SET value=? WHERE id=1').run(JSON.stringify(adminExamples));
}
return db;}
module.exports={openDatabase,hash,verify};
