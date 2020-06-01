import { UserComponent } from './user.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth_gaurd';
import { FavouriteProductsComponent } from '../product/favourite-products/favourite-products.component';
import { CartProductsComponent } from '../product/cart-products/cart-products.component';
import { VirtualCurrencyComponent } from './virtual-currency/virtual-currency.component';
import { KycComponent } from './kyc/kyc.component';
import { VcBlockchainExplorerComponent } from './vc-blockchain-explorer/vc-blockchain-explorer.component';
import { KycBlockchainExplorerComponent } from './kyc-blockchain-explorer/kyc-blockchain-explorer.component';


export const UserRoutes: Routes = [
    {
        path: 'users',
        component: UserComponent,
        canActivate: [ AuthGuard ],
        children: [
            {
                path: '',
                component: UserAccountComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'favourite-products',
                component: FavouriteProductsComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'cart-items',
                component: CartProductsComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'virtual-currency',
                component: VirtualCurrencyComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'kyc-details',
                component: KycComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'vc-blockchain-explorer',
                component: VcBlockchainExplorerComponent,
                outlet: 'profileOutlet'
            },
            {
                path: 'kyc-blockchain-explorer',
                component: KycBlockchainExplorerComponent,
                outlet: 'profileOutlet'
            }
        ]
    }
];
