import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireList, AngularFireObject, AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class KycService {
  kyc: AngularFireList<any>;
  kycObject: AngularFireObject<any>;
  // private kycBlockchainUrl = 'http://localhost:3001/';
  private kycBlockchainUrl = 'https://blockchain-kyc.herokuapp.com/';


  constructor(private db: AngularFireDatabase, private http: HttpClient) {
    this.getkyc();
  }

  createkyc(key, data: any) {
    // this.kyc.push(data);
    this.kyc.set(key, data);
  }

  getkyc() {
    this.kyc = this.db.list('kycPending');
    return this.kyc;
  }

  getkycById(key: string) {
    this.kycObject = this.db.object('kycPending/' + key);
    return this.kycObject;
  }

  updatekyc(data: any) {
    this.kyc.update(data.$key, data);
  }

  deletekyc(key: string) {
    this.kyc.remove(key);
  }

  kycBlockchainConsensus() {
    return this.http.get(this.kycBlockchainUrl + 'consensus');
  }

  kycBlockchain() {
    return this.http.get(this.kycBlockchainUrl + 'blockchain');
  }

  kycBlockchainCreateTransaction(data?) {
    return this.http.post(this.kycBlockchainUrl + 'transaction/broadcast', data);
  }

  kycBlockchainMine() {
    return this.http.get(this.kycBlockchainUrl + 'mine');
  }

  kycBlockchainbyKycId(kycId) {
    return this.http.get(this.kycBlockchainUrl + 'kycDetailById/' + kycId);
  }

  kycBlockchainbyDocumentId(documentId) {
    return this.http.get(this.kycBlockchainUrl + 'kycDetailByDocumentId/' + documentId);
  }

  kycBlockchainbyName(name) {
    return this.http.get(this.kycBlockchainUrl + 'kycDetailByName/' + name);
  }

  kycBlockchainRegisteredNodes() {
    return this.http.get(this.kycBlockchainUrl + 'registeredNodes');
  }

  kycBlockchainRegisterNode(url) {
    return this.http.post(this.kycBlockchainUrl + 'register-and-broadcast-node', url);
  }
}
