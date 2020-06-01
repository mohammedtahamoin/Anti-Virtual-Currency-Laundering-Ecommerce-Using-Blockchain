import { ProductService } from '../../../../shared/services/product.service';
import { Product } from '../../../../shared/models/product';
import { BillingService } from '../../../../shared/services/billing.service';
import { Component, OnInit } from '@angular/core';
import { User, UserDetail } from '../../../../shared/models/user';
import { AuthService } from '../../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { ToastrService } from 'src/app/shared/services/toastr.service';
import { VirtualCurrencyService } from 'src/app/shared/services/virtual-currency.service';

@Component({
    selector: 'app-billing-details',
    templateUrl: './billing-details.component.html',
    styleUrls: [ './billing-details.component.scss' ]
})
export class BillingDetailsComponent implements OnInit {
    paymentMethod: any;
    userDetails: User;
    products: Product[];
    userDetail: UserDetail;
    kycStatus: any;

    constructor(
        private authService: AuthService,
        private billingService: BillingService,
        private productService: ProductService,
        private router: Router,
        private userService: UserService,
        private toastService: ToastrService,
        private virtualCurrencyService: VirtualCurrencyService
    ) {
        /* Hiding Shipping Tab Element */
        document.getElementById('productsTab').style.display = 'none';
        document.getElementById('shippingTab').style.display = 'none';
        document.getElementById('billingTab').style.display = 'block';
        document.getElementById('resultTab').style.display = 'none';

        // this.userDetail = new UserDetail();
        this.products = productService.getLocalCartProducts();
        this.userDetails = authService.getLoggedInUser();
        this.kycStatus = this.userDetails.kyc;
        // console.log('userdetails of constructor', this.userDetails, this.kycStatus);
    }

    ngOnInit() {}

    createUserBilling(userdetails) {
        const data: any = {};
        data['emailId'] = userdetails.email;
        data['customerId'] = userdetails.uid;
        let totalPrice = 0;
        const products = [];
        this.products.forEach((product) => {
            delete product['$key'];
            totalPrice += product.productPrice;
            products.push(product);
        });
        data['products'] = products;
        data['totalPrice'] = totalPrice;
        // getting userdetails object from orderProduct() for kycID
        data['kycId'] = userdetails.kycId;
        data['billingDate'] = Date.now();
        // empty the local storage thus remove cart details.
        this.products.forEach((product) => {
            this.productService.removeLocalCartProduct(product);
        });
        this.billingService.createBillings(data);
        this.router.navigate([ 'checkouts', { outlets: { checkOutlet: [ 'result' ] } } ]);
    }

    orderProduct() {
        let userBalance, userdetails;
        if (this.paymentMethod === 'COD' || this.paymentMethod === 'debitcreditCard') {
            // console.log("payemt method", this.paymentMethod);
            return new Promise((resolve, reject) => {
                userdetails = this.authService.dbUser;
               //  console.log(" userbalance", userdetails);
                resolve(userdetails);
           }).then(() => {
               let totalPrice = 0;
               this.products.forEach((product) => {
                   totalPrice += product.productPrice;
               });
                this.toastService.success('Your order is successfully placed', '');

                // creating transaction object
                const shoppingTransaction = {
                kycId: userdetails.kycId,
                typeOfAction: 'shopping-by-' + this.paymentMethod ,
                customerId: userdetails.uid,
                amount: totalPrice,
                balance: 'NA',
                sender: 'NA',
                recipient: 'NA'
                };
                // send a request to record transaction in blockchain.
                this.virtualCurrencyService.virtualCurrencyBlockchainConsensus().subscribe((consensusResponse) => {
                console.log(consensusResponse);
                    this.virtualCurrencyService.virtualCurrencyBlockchainCreateTransaction
                    (shoppingTransaction).subscribe((transactionResponse: any) => {
                    console.log(transactionResponse);
                    this.virtualCurrencyService.virtualCurrencyBlockchainMine().subscribe((mineResponse: any) => {
                        console.log(mineResponse);
                        this.toastService.success('Transfer transaction Details are successfully mined in Blockchain', '');
                    });
                    });
                });
                this.createUserBilling(userdetails);
            });
        }
        if (this.paymentMethod === 'virtualCurrency') {
            // console.log("payemt method", this.paymentMethod);
            return new Promise((resolve, reject) => {
                 userdetails = this.authService.dbUser;
                //  console.log(" userbalance", userdetails);
                 resolve(userdetails);
            }).then(() => {
                userBalance = userdetails.balance;
                // console.log(" userbalance 2", userBalance);
                let totalPrice = 0;
                this.products.forEach((product) => {
                    totalPrice += product.productPrice;
                });
                if (totalPrice > userBalance) {
                    this.toastService.error("You don't have sufficent  Virtual Currency", 'Recharge Now');
                    return;
                } else {
                  const newBalance = { balance : userBalance - totalPrice };
                  this.userService.updateUser(userdetails.uid, newBalance);
                  this.toastService.success('Your order is successfully placed', '');

                  // creating transaction object
                  const shoppingTransaction = {
                    kycId: userdetails.kycId,
                    typeOfAction: 'shopping-by-virtual-currency',
                    customerId: userdetails.uid,
                    amount: totalPrice,
                    balance: newBalance.balance,
                    sender: 'NA',
                    recipient: 'NA'
                  };
                  // send a request to record transaction in blockchain.
                  this.virtualCurrencyService.virtualCurrencyBlockchainConsensus().subscribe((consensusResponse) => {
                    console.log(consensusResponse);
                      this.virtualCurrencyService.virtualCurrencyBlockchainCreateTransaction
                      (shoppingTransaction).subscribe((transactionResponse: any) => {
                        console.log(transactionResponse);
                        this.virtualCurrencyService.virtualCurrencyBlockchainMine().subscribe((mineResponse: any) => {
                          console.log(mineResponse);
                          this.toastService.success('Transfer transaction Details are successfully mined in Blockchain', '');
                        });
                      });
                   });
                   this.createUserBilling(userdetails);
                }
             });
        }
    }
}
