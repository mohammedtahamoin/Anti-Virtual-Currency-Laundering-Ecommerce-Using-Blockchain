import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireList, AngularFireObject, AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class VirtualCurrencyService {
  virtualCurrency: AngularFireList<any>;
  virtualCurrencyObject: AngularFireObject<any>;
  private virtualCurrencyBlockchainUrl = 'http://localhost:5001/';

  constructor(private db: AngularFireDatabase, private http: HttpClient) {
    this.getvirtualCurrency();
   }

  getvirtualCurrency() {
    this.virtualCurrency = this.db.list('clients');
    return this.virtualCurrency;
  }

  getvirtualCurrencyById(key: string) {
    this.virtualCurrencyObject = this.db.object('clients/' + key);
    return this.virtualCurrencyObject;
  }

  updatevirtualCurrency(data: any) {
    this.virtualCurrency.update(data.$key, data);
  }

  virtualCurrencyBlockchainConsensus() {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'consensus');
  }

  virtualCurrencyBlockchain() {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'blockchain');
  }

  virtualCurrencyBlockchainCreateTransaction(data?) {
    return this.http.post(this.virtualCurrencyBlockchainUrl + 'transaction/broadcast', data);
  }

  virtualCurrencyBlockchainMine() {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'mine');
  }

  virtualCurrencyBlockchainAllTransactions() {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'alltransaction/virtualcurrency');
  }

  virtualCurrencyBlockchainCustomerTransactions(customerId) {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'customerData/' + customerId);
  }

  virtualCurrencyBlockchainKycTransactions(kycId) {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'kyctransaction/' + kycId);
  }

  virtualCurrencyBlockchainRegisteredNodes() {
    return this.http.get(this.virtualCurrencyBlockchainUrl + 'registeredNodes');
  }

  virtualCurrencyBlockchainRegisterNode(url) {
    return this.http.post(this.virtualCurrencyBlockchainUrl + 'register-and-broadcast-node', url);
  }
}
