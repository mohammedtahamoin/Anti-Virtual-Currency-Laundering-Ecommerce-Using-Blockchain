// Core Dependencies
import { RouterModule } from '@angular/router';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

// Configuration and Services
import { UserRoutes } from './user.routing';

// Components
import { UserComponent } from './user.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { VirtualCurrencyComponent } from './virtual-currency/virtual-currency.component';
import { KycComponent } from './kyc/kyc.component';
import { KycBlockchainExplorerComponent } from './kyc-blockchain-explorer/kyc-blockchain-explorer.component';
import { VcBlockchainExplorerComponent } from './vc-blockchain-explorer/vc-blockchain-explorer.component';

@NgModule({
    imports: [CommonModule, SharedModule, RouterModule.forChild(UserRoutes)],
    declarations: [UserComponent, UserAccountComponent, VirtualCurrencyComponent, KycComponent,
         KycBlockchainExplorerComponent, VcBlockchainExplorerComponent],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class UserModule { }
