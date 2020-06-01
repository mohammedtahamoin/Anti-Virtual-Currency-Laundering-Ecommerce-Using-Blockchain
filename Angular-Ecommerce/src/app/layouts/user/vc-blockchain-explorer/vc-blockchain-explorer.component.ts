import { Component, OnInit } from '@angular/core';
import { VirtualCurrencyService } from 'src/app/shared/services/virtual-currency.service';
import { ToastrService } from 'src/app/shared/services/toastr.service';


@Component({
  selector: 'app-vc-blockchain-explorer',
  templateUrl: './vc-blockchain-explorer.component.html',
  styleUrls: ['./vc-blockchain-explorer.component.scss']
})
export class VcBlockchainExplorerComponent implements OnInit {

  vcex = {
    value: '',
    type: ''
  };
  transactionData = [];
  dataloader: boolean;
  registeredNodes = [];
  registerNodeURL: any;

  constructor(private virtualCurrencyService: VirtualCurrencyService , private toastService: ToastrService) { }

  ngOnInit() {
  this.getRegisteredNode();
  this.search();
  }

  getRegisteredNode() {
    this.virtualCurrencyService.virtualCurrencyBlockchainRegisteredNodes().subscribe((response: any) => {
     this.registeredNodes = response.transactionData;
    });
  }

  search() {
    console.log(this.vcex);
    if (this.vcex.type === 'transactionsByKyc') {
      this.dataloader = true;
      this.virtualCurrencyService.virtualCurrencyBlockchainKycTransactions(this.vcex.value).subscribe((response: any) => {
        console.log('transactionsByKyc', response);
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
    if (this.vcex.type === 'transactionByCustomerId') {
      this.dataloader = true;
      this.virtualCurrencyService.virtualCurrencyBlockchainCustomerTransactions(this.vcex.value).subscribe((response: any) => {
        console.log('transactionByCustomerId', response);
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
    if (this.vcex.type === 'allTransaction') {
      this.dataloader = true;
      this.virtualCurrencyService.virtualCurrencyBlockchainAllTransactions().subscribe((response: any) => {
        console.log('allTransaction', response);
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
  }

  registerNodes() {
    const newNodeUrl = {newNodeUrl: this.registerNodeURL};
    this.virtualCurrencyService.virtualCurrencyBlockchainRegisterNode(newNodeUrl).subscribe((response: any) => {
      console.log(response);
      this.getRegisteredNode();
      this.toastService.success( '', response.note);
    }, (err) => {
      console.log(err);
      this.toastService.error('Something wrong wil registering node', err.message);
    });
  }

}
