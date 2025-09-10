// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class NetlifyService {
  
//   private functionUrl = '/.netlify/functions/roomCodeGenerator';

//   constructor(private http: HttpClient) {
//     console.log("Got to netlifyService");
//   }

//   getHelloMessage(name: string): Observable<string> {
//     const url = `${this.functionUrl}?name=${name}`;
//     return this.http.get(url, { responseType: 'text' });
//   }
// }
