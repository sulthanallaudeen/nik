import {Injectable} from '@angular/core';
@Injectable({providedIn:'root'})
export class ApiService {
 url(path:string):string{return new URL('api'+path,document.baseURI).toString()}
 async request(path:string,method='GET',body?:unknown):Promise<any>{const r=await fetch(this.url(path),{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data;}
}
