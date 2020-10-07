import { LightningElement, wire, track } from 'lwc';
import getContacts from '@salesforce/apex/DataController.getContacts';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Id+Name', fieldName: 'idName', type: 'text' },
    {
        label: 'Name',
        fieldName: 'recordLink',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'name' },
            target: '_blank'
        },
        cellAttributes: {
            class: { fieldName: 'name' }
        }
    },
];

export default class ContactTable extends LightningElement {
    columns = COLUMNS;

    @track
    contacts = {};

    @track
    draftValues = [];

    @wire(getContacts)
    wiredLeads(contacts) {
        if (contacts.data) {
            this.contacts = contacts;
            let tempContacts = [];

            contacts.data.forEach(record => {
                let tempRecord = Object.assign({}, record);
                tempRecord.recordLink = `/lightning/r/Contact/${tempRecord.id}/view`;
                tempContacts.push(tempRecord);
            });
            this.contacts.data = tempContacts;
        }
    }

    handleSave(valueToUpdate) {
        const field = Object.assign({}, valueToUpdate);
        const wrapInPromise = fields => updateRecord({ fields });

        wrapInPromise(field)
            .then(() => {
                return refreshApex(this.contacts);
            })
            .catch(error => {
                console.error('error', error);
            })
            .finally(() => {
                this.draftValues = [];
            });
    }

    cellChangeHandler(event) {
        const valueToUpdate = event.detail.draftValues.shift();
        this.handleSave(valueToUpdate);
    }
}