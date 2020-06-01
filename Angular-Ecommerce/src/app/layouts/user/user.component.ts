import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: [ './user.component.scss' ]
})
export class UserComponent implements OnInit {
    userDetails: any;
    uid: any;
    kycStatus: any;
    isAdmin: any;
    userDetailsUpdated: any;

    constructor(public authService: AuthService, private userService: UserService) {
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
        this.isAdmin = this.userDetails && this.userDetails.isAdmin ? this.userDetails.isAdmin : false ;
        this.kycStatus = this.userDetails && this.userDetails.kyc ? this.userDetails.kyc : 'NONE';
        });
    }
}
