public with sharing class DataController {

    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads() {
        List<Lead> leads = [
            SELECT Id, Name, Title, Phone 
            FROM Lead
            WITH SECURITY_ENFORCED
        ];
        return leads;
    }

    @AuraEnabled(cacheable=true)
    public static List<WrapContact> getContacts() {
        List<Contact> contacts = [
            SELECT Id, Name 
            FROM Contact
            WITH SECURITY_ENFORCED
        ];

        List<WrapContact> wrapContacts = new List<WrapContact>();
        for(Contact contactItem : contacts) {
            wrapContacts.add(new WrapContact(contactItem));
        }
        return wrapContacts;
    }

    private class WrapContact {
        @AuraEnabled
        public String id { get; set; }
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String idName { get; set; }

        public WrapContact(Contact contact) {
            this.id = contact.id;
            this.name = contact.Name;
            this.idName = contact.Id + contact.Name;
        }
    }
}
