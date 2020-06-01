# Angular-Ecommerce(Angular7 + Firebase) + Blockchain KYC/Virtual Currency(Node)

**Live Demo** : [Angular-shopping-cart](https://angular-ecom-mtech.firebaseapp.com/login)

**Purpose** The main purpose of this app is to demonstrate how Blockchain can be introduced in eCommerce to stop the laundering of VC (Virtual Currency).It's just to demonstrate the below Architecture in working. This is an eCommerce application with basic functionality and two blockchain ledgers. One to record Virtual Currency transactions and another to record KYC details of users.
For detailed insight, you can read this publication Eliminating Laundering Of Virtual Currency Using Blockchain From Online Transaction.(https://jespublication.com/upload/2019-V10-I9-95.pdf)
![Alt text](https://github.com/mohammedtahamoin/Anti-Virtual-Currency-Laundering-Ecommerce-Using-Blockchain/blob/master/Angular-Ecommerce/src/assets/img/architecture.jpg "Architecture")

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.1.

## Functionalities
There two stakeholders in this application. They are Users and Admin.

**User:**
 User Registration using Firebase Authentication (using Email/Password).After login, a user can place an order. To enable VC access to enjoy special discounts or send VC to others as gifts etc. the user has to get his KYC done.
1. Login -> My Account -> KYC -> Fill KYC Form and Apply -> Once approved KYC ID is assigned and VC option is enabled
2. My Account -> Virtual Currency -> Recharge VC or Send VC
3. Browse Product Catalog -> Add a Product to Cart -> Checkout and payment -> There are three payment options Cash on delivery, Debit/Credit card, and Virtual Currency(If User's KYC is approved)

**Admin:**
An Admin can add/delete products and approve KYC requests.
1. Login -> My Account -> KYC request -> Verify Authenticity of KYC Request Document -> Approve KYC
2. KYC Explorer -> Search KYC Records from KYC-Blockchain -> Add New Node(Blockchain ledger) in Consensus
3. Virtual Currency Explorer -> Search Transaction Details of the User from VC-Blockchain -> Add New Node(Blockchain ledger) in Consensus
4. Product -> Add New Product or Delete Existing Product

## Tools and Technologies

- Technology: HTML, MDBootstrap, CSS, Angular-7, Firebase, jsPDF (to download Receipt as PDF) and Node (For Blockchain).
- Database :  Firebase.

# Installation

1.  Angular CLI
    - [Download Angular CLI](https://cli.angular.io/)
2.  Node.Js
    - [Download Nodejs](https://nodejs.org/en/download/)
3.  Package Manager - NPM 
4.  Clone the repository and run `npm install` in **Angular-Ecommerce**, **Blockchain-kyc** and **Blockchain-virtual-currency**. 
5.  Angular + Firebase Tutorial - [Angular + Firebase + Typescript — Step by step tutorial](https://medium.com/factory-mind/angular-firebase-typescript-step-by-step-tutorial-2ef887fc7d71)
6.  Activate Firebase Authentication Providers

    `Authentication -> Sign-in-method -> Enable Email/Password`

7.  Update the Firebase Database Rules

    `Database -> Rules`

    ```
    {
    "rules": {
        ".read":true,
        ".write": true
    }
    }
    ```

8.  Configure your firebase configuration `src/environments/firebaseConfig.ts`

    ```
    export const FireBaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        databaseURL: "YOUR_DATABASE_URL",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_SENDER_ID"
    };
    ```

9.  For Admin Role `Register New User`

    your registered data will be saved inside the firebase **clients** table.

    ```
        -clients
            -LRSkWxGAKQAFZmyfsx6
                -createdOn: "1542046725"
                -email: "<<YOUR_REGISTERED_EMAIL_ID>>"
                -isAdmin: false      <--- Change this to true
                ...
    ```

    Now you can able to access the Admin Privileges like `Creating Product, Removing Product, Blockchain Explorer etc..`

10. Run the servers. 

## Development server

1. Get into Blockchain-kyc run **npm run node_1** to spinup first Blockchain Node for KYC. The server will run on `http://localhost:3001/`
2. Get into Blockchain-virtual-currency run **npm run node_1** to spinup first Blockchain Node for Virtual Currency.The server will run on `http://localhost:5001/`
3. Get into  Angular Ecommerce Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

**Note:** In Angular-Ecommerce/src/app/shared/services/ in (kyc.service.ts/ virtual-currency.service.ts) change localhost port (if you are using any different port to run Blockchain node server)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## License

This project is licensed under the MIT License - see the [MIT license](https://github.com/mohammedtahamoin/Anti-Virtual-Currency-Laundering-Ecommerce-Using-Blockchain/blob/master/LICENSE) file for details
