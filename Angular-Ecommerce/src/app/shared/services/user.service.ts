import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import * as moment from 'moment';
import { User } from '../models/user';

@Injectable()
export class UserService {
  selectedUser: User = new User();
  users: AngularFireList<any>;

  location = {
    lat: null,
    lon: null
  };
  userdetail: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) {
    this.getUsers();
  }

  getUsers() {
    this.users = this.db.list('clients');
    return this.users;
  }

  getUserdetail(key) {
    this.userdetail = this.db.object('clients/' + key);
    return this.userdetail;
  }

  createUser(data: any) {
    data.location = this.location;
    // data.createdOn = moment(new Date()).format("X");
    data.createdOn = Date.now();
    data.isAdmin = false;
    data.kyc = 'NONE';
    this.users.set(data.uid, data);
  }

  isAdmin(emailId: string) {
    return this.db.list('clients', ref =>
      ref.orderByChild('email').equalTo(emailId)
    );
  }

  updateUser(uid, data: any) {
    console.log('from updateusers', data, uid);
    this.users.update(uid, data);
  }

  setLocation(lat, lon) {
    this.location.lat = lat;
    this.location.lon = lon;
  }
}
