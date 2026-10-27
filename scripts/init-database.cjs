const fs=require('node:fs'),path=require('node:path');
const file=path.resolve(process.env.CRM_DB||path.join(__dirname,'../data/crm.sqlite'));
const existed=fs.existsSync(file);const {createApp}=require('../server/app.cjs');const {db}=createApp(file);
try{db.exec('PRAGMA wal_checkpoint(TRUNCATE)');const integrity=db.prepare('PRAGMA integrity_check').get();if(Object.values(integrity)[0]!=='ok')throw Error('Database integrity check failed');if(db.prepare('PRAGMA foreign_key_check').all().length)throw Error('Database foreign key check failed');console.log(existed?'Existing database upgraded; records preserved.':'Database created and demo accounts added.');console.log('Database: '+file);console.log('Ready. Run npm.cmd start, then open http://localhost:3100')}finally{db.close()}
