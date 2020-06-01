import { Component, OnInit } from '@angular/core';
import { KycService } from 'src/app/shared/services/kyc.service';
import { ToastrService } from 'src/app/shared/services/toastr.service';

@Component({
  selector: 'app-kyc-blockchain-explorer',
  templateUrl: './kyc-blockchain-explorer.component.html',
  styleUrls: ['./kyc-blockchain-explorer.component.scss']
})

export class KycBlockchainExplorerComponent implements OnInit {

  kycex = {
    value: '',
    type: ''
  };
  transactionData = [];
  dataloader: boolean;
  registeredNodes = [];
  registerNodeURL: any;

  constructor(private kycService: KycService, private toastService: ToastrService) { }

  ngOnInit() {
    this.kycService.kycBlockchainRegisteredNodes().subscribe((response: any) => {
     this.registeredNodes = response.transactionData;
    });
  }

  search() {
    if (this.kycex.type === 'kycId') {
      this.dataloader = true;
      this.kycService.kycBlockchainbyKycId(this.kycex.value).subscribe((response: any) => {
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
    if (this.kycex.type === 'documentId') {
      this.dataloader = true;
      this.kycService.kycBlockchainbyDocumentId(this.kycex.value).subscribe((response: any) => {
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
    if (this.kycex.type === 'fullName') {
      this.dataloader = true;
      this.kycService.kycBlockchainbyName(this.kycex.value).subscribe((response: any) => {
        this.transactionData = response.transactionData;
        this.dataloader = false;
      });
    }
  }

  registerNodes() {
    const newNodeUrl = {newNodeUrl: this.registerNodeURL};
    console.log(newNodeUrl);
    this.kycService.kycBlockchainRegisterNode(newNodeUrl).subscribe((response: any) => {
      console.log(response);
      this.toastService.success( '', response.note);
    }, (err) => {
      console.log(err);
      this.toastService.error('Something wrong wil registering node', err.message);
    });
  }


}
