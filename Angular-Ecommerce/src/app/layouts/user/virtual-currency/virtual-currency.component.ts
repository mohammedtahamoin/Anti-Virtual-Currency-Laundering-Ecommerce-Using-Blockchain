import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';
import { VirtualCurrencyService } from 'src/app/shared/services/virtual-currency.service';

declare var toastr: any;

@Component({
  selector: 'app-virtual-currency',
  templateUrl: './virtual-currency.component.html',
  styleUrls: ['./virtual-currency.component.scss']
})
export class VirtualCurrencyComponent implements OnInit {
  sendShow: boolean;
  rechargeShow: boolean;
  userDetails: any;
  uid: any;
  userDetailsUpdated: any;
  balance: any;
  rechargeAmount = 0;
  sendForm = {
    recipient : null,
    amount: 0
  };
  kycId: any;

  constructor(private authService: AuthService, private userService: UserService, private virtualCurrencyService: VirtualCurrencyService) {
    this.userDetails = this.authService.dbUser;
    // console.log(this.userDetails);
    this.uid = this.userDetails.uid;
    this.kycId = this.userDetails.kycId;
    this.balance = this.userDetails.balance;
  }

  ngOnInit() {
    // To update the view once there is a change in user details.
    this.userDetailsUpdated = this.userService.getUserdetail(this.userDetails.uid);
    this.userDetailsUpdated.snapshotChanges().subscribe((res) => {
      // console.log("updated users", res.payload.toJSON());
      this.userDetails =  res.payload.toJSON();
      this.balance = this.userDetails.balance;
    });
  }

  showRecharge() {
    this.rechargeShow = true;
    this.sendShow = false;
  }

  showSend() {
    this.rechargeShow = false;
    this.sendShow = true;
  }

  recharge() {
    // console.log("rechage amount", this.rechargeAmount);
    const newBalance = {
      balance : this.balance + this.rechargeAmount
    };
    this.userService.updateUser(this.uid, newBalance);
    const rechargeTransaction = {
      kycId: this.kycId,
      typeOfAction: 'recharge-virtual-currency',
      customerId: this.uid,
      amount: this.rechargeAmount,
      balance: newBalance.balance,
      sender: 'NA',
      recipient: 'NA'
    };
    // console.log("rechargeTransaction blockchian data", rechargeTransaction);
    this.virtualCurrencyService.virtualCurrencyBlockchainConsensus().subscribe((consensusResponse) => {
      console.log(consensusResponse);
      this.virtualCurrencyService.virtualCurrencyBlockchainCreateTransaction(rechargeTransaction).subscribe((transactionResponse: any) => {
        console.log(transactionResponse);
        this.virtualCurrencyService.virtualCurrencyBlockchainMine().subscribe((mineResponse: any) => {
          console.log(mineResponse);
          toastr.success('Recharge transaction Details are successfully mined in Blockchain');
        });
      });
  });
  }

  send(formdata) {
    // console.log(formdata.value);
    // deducting balance from current balance
    const newBalance = {
      balance : this.balance - formdata.value.amount
    };
    this.userService.updateUser(this.uid, newBalance);

    // adding balance to recipient account
    this.getRecipient(formdata.value.recipient).then((recipientdetails) => {
      // console.log("promise", recipientdetails);
      const balanceRecipient = recipientdetails.balance;
      const newBalanceRecipient = {
          balance : balanceRecipient + formdata.value.amount
      };
      // console.log("nava balance", newBalanceRecipient);
      this.userService.updateUser(formdata.value.recipient, newBalanceRecipient);

      // mining transaction details in blockchain
      const transferTransaction = {
        kycId: this.kycId,
        typeOfAction: 'transfer-virtual-currency',
        customerId: this.uid,
        amount: formdata.value.amount,
        balance: newBalance.balance,
        sender: this.uid,
        recipient: recipientdetails.uid
      };
      // console.log("transferTransaction blockchian data", transferTransaction);
      this.virtualCurrencyService.virtualCurrencyBlockchainConsensus().subscribe((consensusResponse) => {
        console.log(consensusResponse);
          this.virtualCurrencyService.virtualCurrencyBlockchainCreateTransaction
          (transferTransaction).subscribe((transactionResponse: any) => {
            console.log(transactionResponse);
            this.virtualCurrencyService.virtualCurrencyBlockchainMine().subscribe((mineResponse: any) => {
              console.log(mineResponse);
              toastr.success('Transfer transaction Details are successfully mined in Blockchain');
            });
          });
       });
      }
    );
  }
// waiting for subscribe to get result(recipitent balance details) and returning a promise
  getRecipient(recipientAddress): Promise<any> {
    return new Promise((resolve, reject) => {
        const userDetailsRecipient = this.userService.getUserdetail(recipientAddress);
        userDetailsRecipient.snapshotChanges().subscribe((res) => {
        // console.log("recipeint details", res.payload.toJSON());
        const recipientdetails =  res.payload.toJSON();
        resolve(recipientdetails);
      });
    });
  }

}
