//--------------------------
// nativescript-permissions typings file.
//-------------------------
declare module 'permissionsIOS' {
    
        export class PermissionsClass {
    
        private static _contactStore: CNContactStore = CNContactStore.alloc().init()
    
        private _getContactsAuthorization(): CNAuthorizationStatus {
            return CNContactStore.authorizationStatusForEntityType(CNEntityType.Contacts)
        }
    
        isContactsAuthorized(): boolean {
            return this._getContactsAuthorization() == CNAuthorizationStatus.Authorized
        }
    
        isContactsDenied(): boolean {
            let status: CNAuthorizationStatus = this._getContactsAuthorization()
            let denied: boolean = (
                status == CNAuthorizationStatus.Denied
                ||
                status == CNAuthorizationStatus.Restricted
            )
            return denied
        }
    
        requestContactsAuthorization(): Promise<boolean> {
            if (this._getContactsAuthorization() == CNAuthorizationStatus.Authorized) {
                return Promise.resolve(true)
            } else {
                return new Promise((resolve) => {
                    PermissionsClass._contactStore.requestAccessForEntityTypeCompletionHandler(CNEntityType.Contacts, function completionHandler(result: boolean, error: NSError): void {
                        if (error) {
                            global.tnsconsole.error('requestAccessForEntityTypeCompletionHandler > error', error)
                            resolve(false)
                        } else {
                            resolve(result)
                        }
                    })
                })
            }
        }
        
    }
}