import {Injectable} from '@angular/core';
@Injectable({providedIn:'root'})
export class ApiService {
 async request(path:string,method='GET',body?:unknown):Promise<any>{const r=await fetch('/api'+path,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data;}
}
