import { LightningElement, wire, track } from 'lwc';
import getLeads from '@salesforce/apex/DataController.getLeads';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'recordLink',
        type: 'url',
        editable: false,
        typeAttributes: {
            label: { fieldName: "Name" },
            target: "_blank"
        }
    },
    { label: 'Title', fieldName: 'Title', type: 'text', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true }
];

export default class LeadTable extends LightningElement {
    columns = COLUMNS;

    @track
    leads = {};

    @track
    draftValues = [];

    @wire(getLeads)
    wiredLeads(leads) {
        if (leads.data) {
            this.leads = leads;
            let tempLeads = [];
            leads.data.forEach(record => {
                let tempRecord = Object.assign({}, record);
                tempRecord.recordLink = `/lightning/r/Lead/${tempRecord.Id}/view`;
                tempLeads.push(tempRecord);
            });
            this.leads.data = tempLeads;
        }
    }

    handleSave(valueToUpdate) {
        const field = Object.assign({}, valueToUpdate);
        const wrapInPromise = fields => updateRecord({ fields });

        wrapInPromise(field)
            .then(() => {
                return refreshApex(this.leads);
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

    // clearDraft() {
    //     this.columns = [...this.columns];
    // }
}