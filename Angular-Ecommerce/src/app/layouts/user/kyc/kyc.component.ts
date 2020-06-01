import { Component, OnInit} from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User, UserDetail } from '../../../shared/models/user';
import { UserService } from 'src/app/shared/services/user.service';
import { NgForm } from '@angular/forms';
import { KycService } from 'src/app/shared/services/kyc.service';
import * as uuid from 'uuid/v1';
import * as sha256 from 'sha256';

declare var toastr: any;

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss']
})
export class KycComponent implements OnInit  {
  userDetails: User;
  kycStatus;
  kycList: any[];
  loading = false;
  kycForm = {
    fullName: null,
    documentName: null,
    regId: null,
    address: null,
    DOB: null,
    // uploadDocument: null,
    uid: null
  };
  uid: string;
  isAdmin: boolean;
  userDetailsUpdated: any;

  constructor(private authService: AuthService, private userService: UserService,
    private kycService: KycService) {
    // this.userDetails = authService.getLoggedInUser();
    this.userDetails = this.authService.dbUser;
    this.uid = this.userDetails.uid;
    this.isAdmin = this.userDetails.isAdmin ;
    this.kycStatus = this.userDetails && this.userDetails.kyc ? this.userDetails.kyc : 'NONE';
  }

  ngOnInit() {
    // To update the view once there is a change in kyc status or admin status.
    this.userDetailsUpdated = this.userService.getUserdetail(this.userDetails.uid);
    this.userDetailsUpdated.snapshotChanges().subscribe((res) => {
      // console.log("updated users", res.payload.toJSON());
      this.userDetails =  res.payload.toJSON();
      this.isAdmin = this.userDetails.isAdmin ;
      this.kycStatus = this.userDetails && this.userDetails.kyc ? this.userDetails.kyc : 'NONE';
      if (this.isAdmin) {
        this.getAllKyc();
      }
    });
    if (this.isAdmin) {
      this.getAllKyc();
    }
  }

  // to get all pending kyc requests.
  getAllKyc() {
    this.loading = true;
    const x = this.kycService.getkyc();
    x.snapshotChanges().subscribe(
        (kyc) => {
            this.loading = false;
            this.kycList = [];
            kyc.forEach((element) => {
                const y = element.payload.toJSON();
                this.kycList.push(y);
                // console.log("all kyc", this.kycList);
              });
        },
        (err) => {
          toastr.error('Error while fetching Products', err);
        }
    );
  }

  changeKycStatus(status, userId?) {
    console.log('statuschange', status);
    let newKycStatus;
    if (userId) {
      newKycStatus = {
        kyc : status,
      };
      this.userService.updateUser(userId, newKycStatus);
      this.userDetails = this.authService.dbUser;
    } else {
        newKycStatus = {
        kyc : status
      };
      this.userService.updateUser(this.uid, newKycStatus);
      this.userDetails = this.authService.dbUser;
    }
  }

  submitKyc(Formdata: NgForm) {
    this.kycForm.uid = this.uid;
    this.kycService.createkyc(this.uid, this.kycForm);
    this.changeKycStatus('PENDING');
    toastr.success('KYC successfully submitted');
  }

  approve(kyc) {
    // Set KYC status to APPROVED
    this.changeKycStatus('APPROVED', kyc.uid);
    // Create a unique KYC ID
    const createKycDetails = {
      kycApprovedOn : Date.now(),
      kycId: sha256(JSON.stringify(kyc))
      // kycId :  uuid().split("-").join("")
    };
    this.userService.updateUser(kyc.uid, createKycDetails);

    // add balance property
    this.userService.updateUser(kyc.uid, {balance: 0});

    // Mine KYC block in Blockchain
      const kycData: any = this.kycService.getkycById(kyc.uid);
      kycData.snapshotChanges().subscribe(
        (kycInfo: any) => {
            const kycDetails = kycInfo.payload.toJSON();
            console.log('kycingo', kycDetails);
            const kycBlockchainData = {
              documentName : kycDetails.documentName ? kycDetails.documentName : '-',
              documentId : kycDetails.regId ? kycDetails.regId : '-' ,
              fullName : kycDetails.fullName ? kycDetails.fullName : '-',
              address : kycDetails.address ?  kycDetails.address : '-',
              DOB : kycDetails.DOB ? kycDetails.DOB : '-',
              ...createKycDetails
            };
            // console.log("kyc blockchian data", kycBlockchainData);
            this.kycService.kycBlockchainConsensus().subscribe((consensusResponse) => {
              console.log(consensusResponse);
              this.kycService.kycBlockchainCreateTransaction(kycBlockchainData).subscribe((transactionResponse: any) => {
                console.log(transactionResponse);
                this.kycService.kycBlockchainMine().subscribe((mineResponse: any) => {
                  console.log(mineResponse);
                  // Delete from KYC pending list
                  this.kycService.deletekyc(kyc.uid);
                  toastr.success('KYC Details are successfully mined in Blockchain');
                });
              });
          });
        }
    );
  }

  disapprove(kyc) {
    this.changeKycStatus('DISAPPROVED');
    this.kycService.deletekyc(kyc.uid);
  }

}
