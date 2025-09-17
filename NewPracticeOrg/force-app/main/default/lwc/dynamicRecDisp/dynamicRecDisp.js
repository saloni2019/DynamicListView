import { LightningElement, wire, track } from 'lwc';
import CustomDatatable from 'c/customDatatable';
import getObjects from '@salesforce/apex/FetchDynamicRecord.getObjects';
import getChildObjects from '@salesforce/apex/FetchDynamicRecord.getChildObjects';
import getChildFieldNames from '@salesforce/apex/CustomRelatedList.getChildFieldNames';
import getChildFieldNamesForFilteration from '@salesforce/apex/CustomRelatedList.getChildFieldNamesForFilteration';
import getFieldNamesWithType from '@salesforce/apex/CustomRelatedList.getFieldNamesWithType';
import getObjectRecords from '@salesforce/apex/FetchDynamicRecord.getObjectRecords';
import ID from '@salesforce/user/Id';
import searchRecords from '@salesforce/apex/CustomRelatedList.searchRecords';
import relatedObjectSearchRecords from '@salesforce/apex/CustomRelatedList.relatedObjectSearchRecords';
import updateRecords from '@salesforce/apex/CustomRelatedList.updateRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecords from '@salesforce/apex/FetchDynamicRecord.getRecords';
import getFieldTypes from '@salesforce/apex/FetchDynamicRecord.getFieldTypes';
import getFieldsWithDetails from '@salesforce/apex/FetchDynamicRecord.getFieldsWithDetails';
import getFilteredRecords from '@salesforce/apex/FetchDynamicRecord.getFilteredRecords';
import getReferenceObjectName from '@salesforce/apex/FetchDynamicRecord.getReferenceObjectName';
import getFieldNamesWithTypeAndPicklist from '@salesforce/apex/FetchDynamicRecord.getFieldNamesWithTypeAndPicklist';
import getChildFieldNamesForRefFilteration from '@salesforce/apex/FetchDynamicRecord.getChildFieldNamesForRefFilteration';
import assignRecordToSelf from '@salesforce/apex/FetchDynamicRecord.assignRecordToSelf';
import { NavigationMixin } from 'lightning/navigation';

export default class DynamicRecDisp extends NavigationMixin(LightningElement) {
    objectList=[];
    objectSelected;
    objectOptions=[];
    relatedObjectList=[];
    relatedObjectOptions=[];
    displayRelatedObject;
    fieldsOfObject=[];
    fieldsOfFilteration=[];
    storeFieldSelectedAndType=[];
    storeRefFieldSelectedAndType=[];
    storeRefFieldSelected=[];
    showFilterPopUp = false;
    showFilterButton = true;
    displayAfterObjectSelected = false;
    displayAfterRelatedObjectSelected = false;
    checkIfRelatedObjectIsRequired;
    displayRadioButton = false;
    relatedObjectSelected;
    fieldsOfRelatedObject=[];
    isShowModal = false;
    isShowRelatedModal = false;
    parentObjectFieldsSelected;
    fieldsSelectedForFiltering;
    relatedObjectFieldsSelected;
    @track error;
    userFieldSelected;
    userId = ID;
    records = [];
    searchTerm = '';
    searchRelatedTerm = '';
    _records = [];
    _relatedRecords = [];
    columns = [];
    relatedColumns = [];
    pageSizeOptions = [7, 'All']; 
    totalRecords = 0; //Total no.of records
    pageSize; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1;
    totalRelatedRecPages;
    relatedRecordPageNumber = 1;
    relatedListData = [];
    dataWithFieldNames=[];
    dataWithFieldNamesRestore=[];
    showData=false;
    showError = false;
    showRelatedDataError = false;
    draftRelatedValues=[];
    draftValues=[];
    rowsSelected=[];
    rowsRelSelected=[];
    relatedRecordDisplayButton = false;
    displayErrorMessage = false;
    disbaleRelatedModal = false;
    disableObjectModal = false;
    showRelatedData=false;
    relatedRecordList=[];
    relatedRecords = [];
    totalRelatedRecords = 0; // update total records count                 
    relatedPageSize;
    filteredRecords=[];
    filteredRecList=[];
    referenceObjectFields=[];
    referenceObjectName;
    valueOnChange;
    value;
    customDatatable = CustomDatatable;
    privateChildren = {}; 
    fieldList=[];
    relatedFieldList=[];
    sortOrder;
    sortOrderRelated;
    sortFieldOptions=[];
    sortFieldRelatedOptions=[];
    defaultSortDirection = 'asc';
    sortedBy='asc';
    sortField;
    sortByRelated='asc';
    sortField;
    sortRelatedField;
    showFinishButton=true;
    relatedOption=[];
    isSortable;

    connectedCallback() {
        const stored = sessionStorage.getItem('myData');
        const objSelected = sessionStorage.getItem('objectSelected');
        const col = sessionStorage.getItem('columns');
        const fieldOfObj = sessionStorage.getItem('fieldsOfObj');
        const parentObjectFieldsSelection = sessionStorage.getItem('parentObjectFieldsSelected');
        const dataWithFieldNamesRest = sessionStorage.getItem('dataWithFieldNamesRestore');
        const displayRelatedObj = sessionStorage.getItem('displayRelatedObject');
        const relatedObjectOptions = sessionStorage.getItem('relatedObjectOptions');
        const rowsSelected = sessionStorage.getItem('rowsSelected');
        const rowsRelSelected = sessionStorage.getItem('rowsRelSelected');
        const fieldsOfRelatedObject = sessionStorage.getItem('fieldsOfRelatedObject');
        const relatedColumns = sessionStorage.getItem('relatedColumns');
        const relatedObjectSelected = sessionStorage.getItem('relatedObjectSelected');
        const relatedObjectFieldsSelected = sessionStorage.getItem('relatedObjectFieldsSelected');
        const relatedRecordDisplayButton = sessionStorage.getItem('relatedRecordDisplayButton');
        const columnList = sessionStorage.getItem('columnList');
        const relatedFieldList = sessionStorage.getItem('relatedFieldList');
        const rec = sessionStorage.getItem('rec');
        const displayAfterRelatedObjectSelected = sessionStorage.getItem('displayAfterRelatedObjectSelected');
        console.log(fieldOfObj);
        if(objSelected){
            this.displayAfterObjectSelected = true;
            this.objectSelected = objSelected;
            if(fieldOfObj){
                this.fieldsOfObject = JSON.parse(fieldOfObj);
            }
        }
        if(col){
            this.columns = JSON.parse(col);
        }
        if(parentObjectFieldsSelection){
            this.parentObjectFieldsSelected = JSON.parse(parentObjectFieldsSelection);
        }
        if(dataWithFieldNamesRest){
            this.dataWithFieldNamesRestore = JSON.parse(dataWithFieldNamesRest);
        }
        if(displayRelatedObj){
            this.displayRelatedObject = displayRelatedObj;
            this.value = displayRelatedObj;
            console.log('val',this.value);
            
        }
        if(relatedObjectOptions){
            this.relatedObjectOptions = JSON.parse(relatedObjectOptions);
        }
        if(rowsSelected){
            this.rowsSelected = JSON.parse(rowsSelected);
        }
        if(rowsRelSelected){
            this.rowsRelSelected = JSON.parse(rowsRelSelected);
        }
        if(fieldsOfRelatedObject){
            this.fieldsOfRelatedObject = JSON.parse(fieldsOfRelatedObject);
        }
        if(relatedColumns){
            this.relatedColumns = JSON.parse(relatedColumns);
        }
        if(relatedObjectSelected){
            this.relatedObjectSelected = relatedObjectSelected;
        }
        if(relatedObjectFieldsSelected){
            this.relatedObjectFieldsSelected = relatedObjectFieldsSelected;
        }
        if(relatedRecordDisplayButton){
            this.relatedRecordDisplayButton = relatedRecordDisplayButton;
        }
        if(displayAfterRelatedObjectSelected){
            this.displayAfterRelatedObjectSelected = displayAfterRelatedObjectSelected;
        }
        if(columnList){
            this.fieldList = JSON.parse(columnList);
        }
        if(relatedFieldList){
            this.relatedFieldList = JSON.parse(relatedFieldList);
        }
    }

    renderedCallback(){
        if (this.hasRendered) return;
        this.hasRendered = true;
         window.addEventListener('click', (evt) => {
                this.handleClickOnWindow(evt);
            });
        console.log('fdList', JSON.stringify(this.fieldList));
        
        if (this.objectSelected && this.fieldList && this.dataWithFieldNamesRestore) {
            getFilteredRecords({objectAPIName: this.objectSelected, fieldName: this.fieldList, mapOfFilteringVal: this.dataWithFieldNamesRestore}).then((res => {
                console.log('res',JSON.stringify(res));
                this.filteredRecords = res;
                console.log('render filteredRecords',this.filteredRecords);
                if(this.filteredRecords.length > 0){
                    this.showData = true;
                }
                console.log('rendered showData',this.showData);
                console.log('parentObjectFieldsSelected', this.fieldList);
                console.log('dataWithFieldNamesRestore', this.dataWithFieldNamesRestore);
                
                if(!this.showData && this.fieldList){
                    console.log('hiiiiiii');
                    
                    this.showError = true;
                }
                console.log('filteredRecords',this.filteredRecords);
                this.records=[];
                const fieldList = Array.isArray(this.fieldList) ? [...this.fieldList] : [];

                const flattenedRecords = this.filteredRecords.map(rcd => {
                    const flatRecord = { ...rcd };

                    fieldList.forEach(field => {
                        if (field.includes('.')) {
                            const [rel, subField] = field.split('.');
                            const relatedObj = rcd[rel];
                            flatRecord[field] = relatedObj && relatedObj[subField] ? relatedObj[subField] : '';
                        }
                    });

                    return flatRecord;
                });

                console.log('flattenedRecords',JSON.stringify(flattenedRecords));
                this.records = [...flattenedRecords];
                //this.records = res;
                console.log('res',JSON.stringify(this.records));
                this.totalRecords = res.length; // update total records count                 
                this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.paginationHelper();
            }));   
            
        }
        const rec = JSON.stringify(this.rowsSelected);
        console.log('this.displayRelatedObject',this.displayRelatedObject);
        console.log('this.rowsSelected',JSON.stringify(this.rowsSelected));
        this.value = this.displayRelatedObject;
        if (this.displayRelatedObject) {
            getRecords({ objectAPIName: this.relatedObjectSelected, fieldAPINames: this.relatedFieldList, recordId: rec, parentObjectName: this.objectSelected }).then((res => {
                console.log('==>res',res);
                if(res.length > 0){
                    this.showRelatedData = true;
                }
                console.log('showRelatedData',this.showRelatedData);
                console.log('relatedObjectSelected', this.relatedObjectSelected);
                console.log('relatedObjectSelected', this.relatedObjectSelected);
                console.log('relatedObjectFieldsSelected', this.relatedObjectFieldsSelected);
                console.log('rec', rec);
                if(!this.showRelatedData && this.displayRelatedObject == 'Yes' && this.relatedObjectSelected && this.relatedObjectFieldsSelected && rec){
                    console.log('hiiiiiii Tel');
                    this.showRelatedDataError = true;
                }
                let relatedRec = res;
                const flattenedRecords = relatedRec.map(record => {
                    const flatRecord = { ...record };
                    console.log('flatRecord', JSON.stringify(flatRecord));
            
            
                    this.relatedFieldList.forEach(field => {
                        if (field.includes('.')) {
                            const [rel, subField] = field.split('.');
                            flatRecord[field] = record[rel] && record[rel][subField] ? record[rel][subField] : '';
                            }
                        });
                        return flatRecord;
                });
                console.log('flattenedRecords', JSON.stringify(flattenedRecords));
                
                this.relatedRecords = [...flattenedRecords];
                this.totalRelatedRecords = res.length; // update total records count                 
                this.relatedPageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.relatedRecordPaginationHelper();
                        //this.relatedRecordList = res;
                        //console.log('this.relatedRecordList',JSON.stringify(this.relatedRecordList));
            }));   
        }
    }

    @wire(getObjects)
    wireData(data,_error){
        if(data){
            this.objectList = data.data;
            //console.log(JSON.stringify(this.objectList));
            if(this.objectList){
                this.objectOptions = this.objectList.map((obj) => ({ label: obj, value: obj }));
            }
            
        }
    }

    disconnectedCallback() {
        window.removeEventListener('click', () => { });
    }

    handleClickOnWindow(context) {
        
        this.resetPopups('c-datatable-picklist', context);
        this.resetPopups('c-datatable-lookup', context);
    }

    
    resetPopups(markup, context) {
        let elementMarkup = this.privateChildren[markup];
        if (elementMarkup) {
            Object.values(elementMarkup).forEach((element) => {
                element.callbacks.reset(context);
            });
        }
    }

    get radioOptions(){
        return [
            {label:'Yes',value:'Yes'},
            {label:'No',value:'No'}
        ];
    }

    get sortOptions(){
        return[
            {label:'Ascending', value: 'asc'},
            {label:'Descending', value: 'desc'},
        ];
    }

    get optionsForDateCriteria(){
        return [
            {label: 'less than', value: 'less than'},
            {label: 'greater than', value: 'greater than'},
            {label: 'equal to', value: 'equal to'}
        ]
    }

    get optionUserField(){
        return [
            {label:'Created By',value:'Created By'},
            {label:'Owner',value:'Owner'}
        ];
    }

    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }

    get bRelatedRecDisableFirst() {
        return this.relatedRecordPageNumber == 1;
    }
    get bRelatedRecDisableLast() {
        return this.relatedRecordPageNumber == this.totalRelatedRecPages;
    }

    handleDisplayRelatedRecords(_event){
        console.log('this.rowsSelected',this.rowsSelected.length,this.displayRelatedObject);
        if (this.rowsSelected.length == 0 && this.displayRelatedObject == 'Yes') {
            this.displayErrorMessage = true;
        }else{
            this.displayErrorMessage = false;
            this.isShowRelatedModal = true;
            getChildObjects({sObjectType:this.objectSelected}).then((res => {
                this.relatedObjectList = res;
                this.relatedObjectOptions = this.relatedObjectList.map((obj) => ({label: obj, value: obj}));
                sessionStorage.setItem('relatedObjectOptions', JSON.stringify(this.relatedObjectOptions));
            }));
        }
    }

    handleSortOrder(event){
        this.sortOrder = event.target.value;
        
                this.sortFieldOptions = this.parentObjectFieldsSelected.map((obj) => ({label: obj, value: obj}));
                sessionStorage.setItem('sortFieldOptions', JSON.stringify(this.sortFieldOptions));
        
        
    }
    

    handleSortField(event){
        this.sortedBy = event.target.value;
        if(this.sortedBy && this.dataWithFieldNames){
            this.showFilterButton = false;
        }
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.relatedListData];
        console.log('cloneData',JSON.stringify(cloneData));
        
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.relatedListData = cloneData;
        this.sortedBy = sortedBy;
        this.sortOrder = sortDirection;
       
    }

    handleSortOrderRelated(event){
        this.sortOrder = event.target.value;
       
                
       

    }

    handleSortRelatedField(event){
        this.sortByRelated = event.target.value;
        if(this.sortByRelated && this.relatedObjectFieldsSelected){
            this.showFinishButton = false;
        }
    }

    sortByRel(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleRelatedSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.relatedRecordList];
        console.log('cloneData',JSON.stringify(cloneData));
        
        cloneData.sort(this.sortByRel(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.relatedRecordList = cloneData;
        this.sortedByRelated = sortedBy;
        this.sortOrderRelated = sortDirection;
       
    }

    handleObjectSelection(event){
        this.objectSelected = event.target.value;
        console.log("kkl",this.objectSelected);
        sessionStorage.setItem('objectSelected', this.objectSelected);
        if (this.objectSelected != null) {
            this.displayAfterObjectSelected = true;
            getChildFieldNames({sObjectApiName: this.objectSelected}).then((res => {
                this.fieldsOfObject = res.map((mp)=>({label:mp,value:mp }));
                sessionStorage.setItem('fieldsOfObj', JSON.stringify(this.fieldsOfObject));
            })); 
        }
    }

    handleHeaderClose(){
        this.isShowModal = false;
    }

    handleUserField(event){
        this.userFieldSelected = event.target.value;
    }

    handleFieldSelect(event){
        this.parentObjectFieldsSelected = event.detail.value;
        if(this.parentObjectFieldsSelected){
            this.displayRadioButton = true;
        }
    }

    handleRelatedObjectFieldSelect(event){
        this.relatedObjectFieldsSelected = event.detail.value;
        sessionStorage.setItem('relatedObjectFieldsSelected', JSON.stringify(this.relatedObjectFieldsSelected));
        this.sortFieldRelatedOptions = this.relatedObjectFieldsSelected.map((obj) => ({label: obj, value: obj}));
                sessionStorage.setItem('sortFieldRelatedOptions', JSON.stringify(this.sortFieldRelatedOptions));
    }

    handleRadioChange(event){
        this.displayRelatedObject = event.detail.value;
        if (this.displayRelatedObject == 'Yes') {
            this.relatedRecordDisplayButton = true;
        }
        if (this.displayRelatedObject == 'No') {
            this.relatedRecordDisplayButton = false;
        }
        sessionStorage.setItem('displayRelatedObject', JSON.stringify(this.displayRelatedObject));
        sessionStorage.setItem('relatedRecordDisplayButton', JSON.stringify(this.relatedRecordDisplayButton));
    }

    handleRegisterItem(event) {
        console.log('handleRegisterItem:::',JSON.stringify(event.detail));
        event.stopPropagation(); 
        const item = event.detail;
        if (!this.privateChildren.hasOwnProperty(item.name))
            this.privateChildren[item.name] = {};
        this.privateChildren[item.name][item.guid] = item;
    }

    handleSelectFields(_event){
        this.showFilterPopUp = true;
        getChildFieldNamesForFilteration({sObjectApiName: this.objectSelected}).then((res => {
                this.fieldsOfFilteration = res.map((mp)=>({label:mp,value:mp }));
            })); 
        this.dataWithFieldNames=[];
        this.dataWithFieldNamesRestore=[];
        this.storeFieldSelectedAndType = [];
        this.refFieldEntries= [];
    }

    handleOkay(_event){
        this.isShowModal = false;
    }

    hideRelatedModalBox(_event){
        this.isShowRelatedModal = false;
    }

    // handleFinishForRelated(event){
    //     if (this.relatedObjectFieldsSelected && this.relatedObjectSelected) {
    //         this.isShowRelatedModal = false;
    //         console.log(this.rowsSelected[0]);
    //         const rec = JSON.stringify(this.rowsSelected);
    //         sessionStorage.setItem('rec', JSON.stringify(this.rowsSelected));
    //         // Output the result
    //         console.log(rec);
    //         getFieldNamesWithType({ sObjectApiName: this.relatedObjectSelected }).then(res => {
    //             this.relatedColumns = Object.keys(res).filter((val) => this.relatedObjectFieldsSelected.includes(val)).map((key) => ({
    //                 label: key,
    //                 fieldName: key,
    //                 type: res[key].toLowerCase(),
    //                 editable: key === 'Id' ? false : true,
    //             }));
    //             sessionStorage.setItem('relatedColumns', JSON.stringify(this.relatedColumns));
    //             console.log('res',res);
    //             console.log('relatedObjectSelected',this.relatedObjectSelected);
    //             getRecords({ objectAPIName: this.relatedObjectSelected, fieldAPINames: this.relatedObjectFieldsSelected, recordId: rec, parentObjectName: this.objectSelected }).then((res => {
    //                 console.log('==>res',res);
    //                 this.relatedRecords = res;
    //                 if(res){
    //                     this.showRelatedData = true;
    //                 }
    //                 if(!this.showRelatedData && this.relatedObjectSelected && this.relatedObjectFieldsSelected && rec){
    //                     console.log('hiiiiiii Tel');
    //                     this.showRelatedDataError = true;
    //                 }
    //                 this.totalRelatedRecords = res.length; // update total records count                 
    //                 this.relatedPageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
    //                 this.relatedRecordPaginationHelper();
    //                 //this.relatedRecordList = res;
    //                 //console.log('this.relatedRecordList',JSON.stringify(this.relatedRecordList));
    //             }));
                
    //         }).catch(error => {
    //             console.log(error);
    //         });
            
            
    //     }
    // }

    async handleFinishForRelated(_event){
        if (this.relatedObjectFieldsSelected && this.relatedObjectSelected) {
            this.isShowRelatedModal = false;
            console.log(this.rowsSelected[0]);
            const rec = JSON.stringify(this.rowsSelected);
            sessionStorage.setItem('rec', JSON.stringify(this.rowsSelected));
            // Output the result
            console.log(rec);
            const res = await getFieldNamesWithType({ sObjectApiName: this.relatedObjectSelected });

            const fieldNames = Object.keys(res).filter(val => this.relatedObjectFieldsSelected.includes(val));

            const columnPromises = fieldNames.map(async (key) => {
            const lowerType = res[key].toLowerCase();
            const isPicklist = res[key] === 'PICKLIST';
            const isRef = res[key] === 'REFERENCE';

            let nonEditable = res[key] == 'DATETIME' || res[key] == 'DATE' || res[key] == 'TIME' || res[key] == 'ID' ? true : false;
            let options = [];

            if (isPicklist) {
                console.log('key',key);
                
                options = await this.getPicklistRelatedOptionsForField(key);
                console.log('options',JSON.stringify(options));
                
                return {
                    label: key,
                    fieldName: key,
                    type: 'picklist',
                    editable: isPicklist ||  nonEditable ? false : true,
                    sortable: key == this.sortByRelated ? true : false,
                    typeAttributes: {
                        placeholder: 'Select value',
                        options: options,
                        label: key,
                        value: { fieldName: key },
                        context: { fieldName: 'Id' },
                        editable: false
                    },
                    cellAttributes: {
                        class: { fieldName: key }
                    }
                };
            }

            if (isRef) {
                if (isRef) {
                    const relatedLabelField = key.replace(/Id$/, '') + '.Name';

                    return {
                        label: key,
                        fieldName: relatedLabelField, // this is the correct field path
                        type: 'text',
                        editable: false,
                        sortable: key == this.sortByRelated ? true : false
                    };
                }


            }
            console.log('sortByRelated',this.sortByRelated);
                console.log('key',key);
            // Default non-picklist and non-ref field
            return {
                label: key,
                fieldName: key,
                type: lowerType,
                editable: !nonEditable,
                sortable: key == this.sortByRelated ? true : false
            };
        });
        this.relatedColumns = await Promise.all(columnPromises);
        this.relatedColumns.push({
            label: 'View',
            type: 'button',
            typeAttributes: {
                label: 'Open',
                name: 'openRecord',
                variant: 'base'
            }
        });
        sessionStorage.setItem('relatedColumns', JSON.stringify(this.relatedColumns));

        console.log('==>relatedColumns', JSON.stringify(this.relatedColumns));
        this.relatedFieldList = this.relatedColumns.filter(col => col.type !== 'button' && col.fieldName).map(col => col.fieldName);
        console.log('==>relatedFieldList', JSON.stringify(this.relatedFieldList));
        sessionStorage.setItem('relatedFieldList', JSON.stringify(this.relatedFieldList));
        const filtered = await getRecords({
            objectAPIName: this.relatedObjectSelected, 
            fieldAPINames: this.relatedFieldList, 
            recordId: rec, 
            parentObjectName: this.objectSelected 
        });
        console.log('filtered', JSON.stringify(filtered));
        
         const flattenedRecords = filtered.map(record => {
            const flatRecord = { ...record };
            console.log('flatRecord', JSON.stringify(flatRecord));
    
    
            this.relatedFieldList.forEach(field => {
                if (field.includes('.')) {
                    const [rel, subField] = field.split('.');
                    flatRecord[field] = record[rel] && record[rel][subField] ? record[rel][subField] : '';
                    }
                });
                return flatRecord;
        });
        console.log('flattenedRecords', JSON.stringify(flattenedRecords));
        
        this.relatedRecords = [...flattenedRecords];
        //this.records = [...filtered];
        this.showRelatedData = filtered.length > 0 ? true : false;
        if(this.relatedRecords.length == 0){
            this.showRelatedDataError = true;
        }
        this.totalRelatedRecords = filtered.length;
        this.relatedPageSize = this.pageSizeOptions[0];
        this.relatedRecordPaginationHelper();
        }
    }

    handleRefSelection(event) {
    const referenceField = event.target.dataset.subfield;               // e.g., CreatedBy
    const subField = event.target.value;                    // e.g., Name
    const objectApi = event.target.name;       // e.g., User
    console.log(event.target.dataset.subfield);
    console.log(event.target.value);
    console.log(event.target.name);
    getFieldTypes({
        objectApiName: objectApi,
        fieldApiNames: subField
    }).then((res) => {
        console.log('Apex response:', res);
        const fieldMeta = res[subField];
        if (!fieldMeta) {
            console.warn(`Missing field metadata for ${subField}`);
            return;
        }
    
        const key = `${referenceField}.${subField}`;
        this.storeRefFieldSelectedAndType = {
            ...this.storeRefFieldSelectedAndType,
            [key]: {
                referenceField,
                subField,
                referenceObject: objectApi,
                objectName: objectApi,
                fieldType: fieldMeta.FieldType,
                label: fieldMeta.Label
            }
        };
        sessionStorage.setItem('storeRefFieldSelectedAndType', JSON.stringify(this.storeRefFieldSelectedAndType));
        console.log('Updated storeRefFieldSelectedAndType', this.storeRefFieldSelectedAndType);
    }).catch(err => {
        console.error('Error in getFieldTypes:', err);
    });
    
}


    handleFieldSelectForFilter(event) {
        this.fieldsSelectedForFiltering = event.detail.value;
        this.referenceObjectFields = [];
    
        getFieldTypes({
            objectApiName: this.objectSelected,
            fieldApiNames: this.fieldsSelectedForFiltering
        }).then((res) => {
            this.storeFieldSelectedAndType = res;
            const refFieldToObjectMap = {};   
            const objectToOptionsMap = {};    
            const fetchPromises = [];
    
            this.fieldsSelectedForFiltering.forEach((fd) => {
                const fieldType = this.storeFieldSelectedAndType[fd]?.FieldType;
                console.log(fieldType);
                
                if (fieldType === 'REFERENCE') {
                    const p = getReferenceObjectName({
                        objectAPIName: this.objectSelected,
                        fieldAPIName: fd
                    }).then((apiName) => {
                        refFieldToObjectMap[fd] = apiName;
                        console.log(refFieldToObjectMap);
                        
                        if (!objectToOptionsMap[apiName]) {
                            return getChildFieldNamesForRefFilteration({ sObjectApiName: apiName }).then((fields) => {
                                objectToOptionsMap[apiName] = fields.map(f => ({ label: f, value: f }));
                            });
                        }
                    });
    
                    fetchPromises.push(p);
                }
            });
    
            Promise.all(fetchPromises).then(() => {
                this.referenceObjectFields = Object.keys(refFieldToObjectMap).map((refField) => {
                    const refObjName = refFieldToObjectMap[refField];
                    console.log(refObjName);
                    
                    return {
                        fieldName: refField.replace(/Id$/, ''),
                        referenceObjectName: refObjName,
                        options: objectToOptionsMap[refObjName]
                    };
                });
                sessionStorage.setItem('referenceObjectFields', JSON.stringify(this.referenceObjectFields));
                console.log('referenceObjectFields', JSON.stringify(this.referenceObjectFields));
            });
        });
    
        console.log(JSON.stringify(event.detail));
    }
    

    get fieldEntries() {
        return Object.keys(this.storeFieldSelectedAndType).map(key => {
            const fieldInfo = this.storeFieldSelectedAndType[key];
            console.log('fieldInfo',JSON.stringify(fieldInfo));
            return {
                fieldName: key,
                isString: fieldInfo.FieldType?.toUpperCase() === 'STRING',
                isTextArea: fieldInfo.FieldType?.toUpperCase() === 'TEXTAREA',
                isId: fieldInfo.FieldType?.toUpperCase() === 'ID',
                isCurrency: fieldInfo.FieldType?.toUpperCase() === 'CURRENCY',
                isDouble: fieldInfo.FieldType?.toUpperCase() === 'DOUBLE',
                isInteger: fieldInfo.FieldType?.toUpperCase() === 'INT',
                isBoolean: fieldInfo.FieldType?.toUpperCase() === 'BOOLEAN',
                isPhone: fieldInfo.FieldType?.toUpperCase() === 'PHONE',
                isUrl: fieldInfo.FieldType?.toUpperCase() === 'URL',
                isEmail: fieldInfo.FieldType?.toUpperCase() === 'EMAIL',
                isDate: fieldInfo.FieldType?.toUpperCase() === 'DATE',
                isDateTime: fieldInfo.FieldType?.toUpperCase() === 'DATETIME',
                isPicklist: fieldInfo.FieldType === 'PICKLIST',
                fieldInfo: {
                    ...fieldInfo,
                    options: fieldInfo.FieldType === 'PICKLIST'
                        ? fieldInfo.Picklist.map(val => ({ label: val, value: val }))
                        : null
                }
            };
        });
    }

    get refFieldEntries() {
        return Object.keys(this.storeRefFieldSelectedAndType).map(key => {
            const info = this.storeRefFieldSelectedAndType[key];
            if (!info || !info.fieldType) {
                console.warn(`Missing info for key: ${key}`, info);
                return null; // Skip if undefined
            }
    
            return {
                fieldName: key,
                objectName: info.referenceObject,
                isString: info.fieldType?.toUpperCase() === 'STRING',
                isTextArea: info.fieldType?.toUpperCase() === 'TEXTAREA',
                isId: info.fieldType?.toUpperCase() === 'ID',
                isCurrency: info.fieldType?.toUpperCase() === 'CURRENCY',
                isDouble: info.fieldType?.toUpperCase() === 'DOUBLE',
                isInteger: info.fieldType?.toUpperCase() === 'INT',
                isBoolean: info.fieldType?.toUpperCase() === 'BOOLEAN',
                isPhone: info.fieldType?.toUpperCase() === 'PHONE',
                isUrl: info.fieldType?.toUpperCase() === 'URL',
                isEmail: info.fieldType?.toUpperCase() === 'EMAIL',
                isDate: info.fieldType?.toUpperCase() === 'DATE',
                isDateTime: info.fieldType?.toUpperCase() === 'DATETIME',
                isPicklist: info.fieldType === 'PICKLIST',
                fieldInfo: {
                    ...info,
                    options: info.fieldType === 'PICKLIST'
                        ? info.picklistValues?.map(val => ({ label: val, value: val }))
                        : null
                }
            };
        }).filter(Boolean); // Remove any nulls
    }
    


    hideModalBox(_event){
        this.showFilterPopUp = false;
        if(this.parentObjectFieldsSelected){
            this.isShowModal = false;
            this.showData = true;
            getFieldNamesWithType({ sObjectApiName: this.objectSelected }).then(res => {
                this.columns = Object.keys(res).filter((val) => this.parentObjectFieldsSelected.includes(val)).map((key) => ({
                    label: key,
                    fieldName: key,
                    type: res[key].toLowerCase(),
                    editable: key === 'Id' ? false : true,
                }));
    
                getObjectRecords({ objectAPIName: this.objectSelected, fieldAPINames: this.parentObjectFieldsSelected, userId: this.userId }).then((res => {
                    this.records = res;
                    this.totalRecords = res.length; // update total records count                 
                    this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                    this.paginationHelper();
                    //this._records = res;
                    console.log('this.relatedDataList',JSON.stringify(this.relatedListData));
                }));
            }).catch(error => {
                console.log(error);
            });
        }
        
    }

    handleChange(event){
        console.log('Name',event.target);
        console.log('Field', event.target.name);
        let fieldName = event.target.name;
        let fieldVal;
        console.log('type',event.target.dataset.fieldType);
        this.sortFieldOptions = this.parentObjectFieldsSelected.map((obj) => ({label: obj, value: obj}));
        sessionStorage.setItem('sortFieldOptions', JSON.stringify(this.sortFieldOptions));
        if (event.target.type === 'number') {
            fieldVal = parseFloat(event.target.value); 
        } if (event.target.type === 'date' || event.target.type === 'datetime-local') {
            const dateObj = new Date(event.target.value);
            const year = dateObj.getFullYear();
            const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
            const day = ('0' + dateObj.getDate()).slice(-2);
            const formattedDate = `${year}-${month}-${day}`; 
            fieldVal = formattedDate;
        }if (event.target.type === 'checkbox') {
            fieldVal = event.target.checked;
        }if (event.target.type === 'text' || event.target.type === 'email' || event.target.type === 'phone' || event.target.type === 'Id' || event.target.type === 'URL'){
            fieldVal = event.target.value; 
        }if (event.target.dataset.fieldType == 'picklist'){
            fieldVal = event.target.value;
        } 
        console.log('fieldVal', typeof fieldVal);
        
        this.dataWithFieldNames = {
            ...this.dataWithFieldNames,
            [fieldName]: fieldVal
        };
        // if (fieldName) {
        //     this.showFilterButton = false;
        // }
        console.log('dataWithFieldNames', JSON.stringify(this.dataWithFieldNames));
    }

    // handleDateOptionCriteria(event){
    //     const optionGreaterLesserEqual = event.target.value;
    //     this.dataWithFieldNames = {
    //         ...this.dataWithFieldNames,
    //         ['optionGreaterLesserEqual']: optionGreaterLesserEqual
    //     };
    //     console.log('dataWithFieldNames', JSON.stringify(this.dataWithFieldNames));
    // }

    handleRelatedObjectSelection(event){
        this.relatedObjectSelected = event.target.value;
        console.log("relatedObjectSelected",this.relatedObjectSelected);
        sessionStorage.setItem('relatedObjectSelected', this.relatedObjectSelected);
        if (this.relatedObjectSelected) {
            this.displayAfterRelatedObjectSelected = true;
            sessionStorage.setItem('displayAfterRelatedObjectSelected', JSON.stringify(this.displayAfterRelatedObjectSelected));
            getChildFieldNames({sObjectApiName: this.relatedObjectSelected}).then((res => {
                this.fieldsOfRelatedObject = res.map((mp)=>({label:mp,value:mp }));
                console.log(JSON.stringify(res));
                sessionStorage.setItem('fieldsOfRelatedObject', JSON.stringify(this.fieldsOfRelatedObject));
            })).catch(error => {
                this.error = error;
                console.log(error);
            });
            
        } 
    }


    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    // JS function to handel pagination logic 
    paginationHelper() {
        this.relatedListData = [];
        // calculate total pages
        if(this.pageSize != 'All'){
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        }else{
            this.totalPages = 1;
        }
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
            
        }
        this._records = [];
        console.log('records', JSON.stringify(this.records));
        console.log('_records length', this._records.length);
        console.log('_records', JSON.stringify(this._records));
        console.log('totalRecords', this.totalRecords);
        console.log('pageSize', this.pageSize);
        // set records to display on current page 
        if(this.pageSize != 'All' && this._records.length <= this.totalRecords){
            console.log('I am here in IF');
            for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
                console.log('===>lrrrr', this.totalRecords,this.pageNumber);
                if (i === this.totalRecords) {
                    break;
                }
                this.relatedListData.push(this.records[i]);
            }
            this._records=this.relatedListData;
        }else if(this.pageSize == 'All' && this._records.length <= this.totalRecords){
            console.log('I am here in Else IF');
            for (let i = 0; i < this.totalRecords; i++) {
                if (i === this.totalRecords) {
                    break;
                }
                this.relatedListData.push(this.records[i]);
                this._records.push(this.records[i]);
                
            }
            this._records=this.relatedListData;
        }
        sessionStorage.setItem('myData', JSON.stringify(this.relatedListData));
    }

    handleRelatedRecordsPerPage(event) {
        this.relatedPageSize = event.target.value;
        this.relatedRecordPaginationHelper();
    }
    relatedRecordPreviousPage() {
        this.relatedRecordPageNumber = this.relatedRecordPageNumber - 1;
        this.relatedRecordPaginationHelper();
    }
    relatedRecordNextPage() {
        this.relatedRecordPageNumber = this.relatedRecordPageNumber + 1;
        this.relatedRecordPaginationHelper();
    }
    relatedRecordFirstPage() {
        this.relatedRecordPageNumber = 1;
        this.relatedRecordPaginationHelper();
    }
    relatedRecordLastPage() {
        this.relatedRecordPageNumber = this.totalRelatedRecPages;
        this.relatedRecordPaginationHelper();
    }
    // JS function to handel pagination logic 
    relatedRecordPaginationHelper() {
        this.relatedRecordList = [];
        // calculate total pages
        if(this.relatedPageSize != 'All'){
            this.totalRelatedRecPages = Math.ceil(this.totalRelatedRecords / this.relatedPageSize);
        }else{
            this.totalRelatedRecPages = 1;
        }
        // set page number 
        if (this.relatedRecordPageNumber <= 1) {
            this.relatedRecordPageNumber = 1;
        } else if (this.relatedRecordPageNumber >= this.totalRelatedRecPages) {
            this.relatedRecordPageNumber = this.totalRelatedRecPages;
            
        }
        // set records to display on current page 
        this._relatedRecords = this.relatedRecords;
        console.log('this._relatedRecords.length',this._relatedRecords.length);
        console.log('this.totalRelatedRecords',this.totalRelatedRecords);
        if(this.relatedPageSize != 'All' && this._relatedRecords.length <= this.totalRelatedRecords){
            console.log('===>lllllll', this.totalRelatedRecords);
            for (let i = (this.relatedRecordPageNumber - 1) * this.relatedPageSize; i < this.relatedRecordPageNumber * this.relatedPageSize; i++) {
                console.log('===>lllllll', this.totalRelatedRecords,this.relatedRecordPageNumber);
                if (i === this.totalRelatedRecords) {
                    break;
                }
                this.relatedRecordList.push(this.relatedRecords[i]);
            }
            this._relatedRecords=this.relatedRecordList;
        }else if(this.relatedPageSize == 'All' && this._relatedRecords.length <= this.totalRelatedRecords){
            console.log('===> Jdijawdw');
            for (let i = 0; i < this.totalRelatedRecords; i++) {
                console.log('I am insifde');
                
                if (i === this.totalRelatedRecords) {
                    console.log('Iam shit');
                    
                    break;
                }
                this.relatedRecordList.push(this.relatedRecords[i]);
                //this._relatedRecords.push(this.relatedRecords[i]);
                
            }
            this._relatedRecords=this.relatedRecordList;
        }
        
    }

    handleSearchTermChange(event){
        this.searchTerm = event.target.value;
        
        console.log('searchTerm',this.searchTerm);
        if (this.searchTerm && this.searchTerm.length > 2) {
            console.log('rowsSelected',JSON.stringify(this.rowsSelected));
            searchRecords({ searchTerm: this.searchTerm, objectAPIName: this.objectSelected, columnNames: this.parentObjectFieldsSelected.toString() }).then(res => {
                this.relatedListData=[];
                this.relatedListData = res[0];
            });
        } else if(this.searchTerm.length == 0){
            this.relatedListData=[];
            this.relatedListData = this._records;
            console.log(this.relatedListData);
        }
    }

    // handleRelatedSearchTermChange(event){
    //     this.searchRelatedTerm = event.target.value;
        
    //     console.log('searchRelatedTerm',this.searchRelatedTerm);
    //     if (this.searchRelatedTerm && this.searchRelatedTerm.length > 2) {
    //         relatedObjectSearchRecords({ searchTerm: this.searchRelatedTerm, objectAPIName: this.relatedObjectSelected, columnNames: this.relatedObjectFieldsSelected.toString(),  parentObject: this.objectSelected}).then(res => {
    //             this.relatedRecordList=[];
    //             this.relatedRecordList = res[0];
    //         });
    //     } else if(this.searchRelatedTerm.length == 0){
    //         this.relatedRecordList=[];
    //         this.relatedRecordList = this._relatedRecords;
    //         console.log(this.relatedRecordList);
    //     }
    // }

    handleEmailButton(){

    }
    handleRowSelection(evt) {
        const selectedRows = evt.detail.selectedRows;
        //console.log(evt.detail.config.action);
        console.log(evt.detail.selectedRows.length);
        if (evt.detail.config.action == 'rowSelect') {
            for(let i=0;i<evt.detail.selectedRows.length;i++){
                if (!this.rowsSelected.includes(evt.detail.selectedRows[i].Id)) {
                    this.rowsSelected.push(evt.detail.selectedRows[i].Id);
                }
                
            }
        }

        if (evt.detail.config.action == 'rowDeselect') {
            console.log('resrsersersr',evt.detail.selectedRows);
            this.rowsSelected=[];
            for(let i=0;i<evt.detail.selectedRows.length;i++){
                this.rowsSelected.push(evt.detail.selectedRows[i].Id);
            }
            
            if (evt.detail.selectedRows.length == 0) {
                this.rowsSelected.pop();
            }
        }
        sessionStorage.setItem('rowsSelected', JSON.stringify(this.rowsSelected));
        console.log('rowsSelected',this.rowsSelected);
        if (this.rowsSelected.length==0) {
            this.showRelatedData = false;
        }
        console.log('mydatara',JSON.stringify(this.rowsSelected));
        
        // Display that fieldName of the selected rows
        
    }

    handleRelatedRowSelection(evt){
        const selectedRows = evt.detail.selectedRows;
        //console.log(evt.detail.config.action);
        console.log('evttt',evt.detail.selectedRows.length);
        if (evt.detail.config.action == 'rowSelect') {
            for(let i=0;i<evt.detail.selectedRows.length;i++){
                if (!this.rowsRelSelected.includes(evt.detail.selectedRows[i].Id)) {
                    this.rowsRelSelected.push(evt.detail.selectedRows[i].Id);
                }
                
            }
        }

        if (evt.detail.config.action == 'rowDeselect') {
            console.log('resrsersersr',evt.detail.selectedRows);
            this.rowsRelSelected=[];
            for(let i=0;i<evt.detail.selectedRows.length;i++){
                this.rowsRelSelected.push(evt.detail.selectedRows[i].Id);
            }
            
            if (evt.detail.selectedRows.length == 0) {
                this.rowsRelSelected.pop();
            }
        }
        sessionStorage.setItem('rowsRelSelected', JSON.stringify(this.rowsRelSelected));
        console.log('rowsRelSelected',this.rowsRelSelected);
        
        console.log('mydatara',JSON.stringify(this.rowsRelSelected));
    }

    handleSave(event) {
        const updatedFields = event.detail.draftValues.map(draft => ({
            Id: draft.Id,
            ...draft
        }));

        this.saveDraftValues = event.detail.draftValues;
        
        updateRecords({ recordsToUpdate: this.saveDraftValues, recordObject: this.objectSelected }).then(_res => {
            const event = new ShowToastEvent({
                title: 'Success!',
                message: 'Record is Saved Successfully',
                variant: 'Success'
            });
            this.dispatchEvent(event);
            console.log(JSON.stringify(this.dataWithFieldNamesRestore));
            
            getFilteredRecords({objectAPIName: this.objectSelected, fieldName: this.fieldList, mapOfFilteringVal: this.dataWithFieldNamesRestore}).then((res => {
                console.log('res',JSON.stringify(res));
                this.filteredRecords = res;
                const flattenedRecords = this.filteredRecords.map(rcd => {
                        const flatRecord = { ...rcd };

                        this.fieldList.forEach(field => {
                            if (field.includes('.')) {
                                const [rel, subField] = field.split('.');
                                const relatedObj = rcd[rel];
                                flatRecord[field] = relatedObj && relatedObj[subField] ? relatedObj[subField] : '';
                            }
                        });

                        return flatRecord;
                    });

                    console.log('flattenedRecords',JSON.stringify(flattenedRecords));
                    
                console.log('filteredRecords',this.filteredRecords);
                this.records=[];
                this.records = [...flattenedRecords];
                console.log('res',JSON.stringify(this.records));
                this.totalRecords = res.length; // update total records count                 
                this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.paginationHelper();
            }));
            this.draftValues = [];
        }).catch(error => {
            console.log(error);
            this.draftValues = [];
            const event = new ShowToastEvent({
                title: 'Failure!',
                message: error.body.message,
                variant: 'Error'
            });
            this.dispatchEvent(event);
        });
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues; // Track the changes
        console.log('I am eerer', this.draftValues);
        
        this.isEditing = true; // Show Save and Cancel buttons
    }

    handleRelatedSave(event) {
        console.log('Related',event.detail.draftValues);
        const updatedFields = event.detail.draftValues.map(draft => ({
            Id: draft.Id,
            ...draft
        }));

        this.saveDraftValues = event.detail.draftValues;
        const rec = JSON.stringify(this.rowsSelected);
        updateRecords({ recordsToUpdate: this.saveDraftValues, recordObject: this.relatedObjectSelected }).then(_res => {
            const event = new ShowToastEvent({
                title: 'Success!',
                message: 'Record is Saved Successfully',
                variant: 'Success'
            });
            this.dispatchEvent(event);
            // getFieldNamesWithType({ sObjectApiName: this.relatedObjectSelected }).then(res => {
            //     const fieldNames = Object.keys(res).filter(val => this.relatedObjectFieldsSelected.includes(val));

            //     const columnPromises = fieldNames.map( (key) => {
            //     const lowerType = res[key].toLowerCase();
            //     const isPicklist = res[key] === 'PICKLIST';
            //     const isRef = res[key] === 'REFERENCE';

            //     let nonEditable = res[key] == 'DATETIME' || res[key] == 'DATE' || res[key] == 'TIME' || res[key] == 'ID' ? true : false;
            //     let options = [];

            //     if (isPicklist) {
            //         console.log('key',key);
                    
            //         options = this.getPicklistRelatedOptionsForField(key);
            //         console.log('options',JSON.stringify(options));
                    
            //         return {
            //             label: key,
            //             fieldName: key,
            //             type: 'picklist',
            //             editable: isPicklist ||  nonEditable ? false : true,
            //              sortable: key == this.sortByRelated ? true : false,
            //             typeAttributes: {
            //                 placeholder: 'Select value',
            //                 options: options,
            //                 label: key,
            //                 value: { fieldName: key },
            //                 context: { fieldName: 'Id' },
            //                 editable: false
            //             },
            //             cellAttributes: {
            //                 class: { fieldName: key }
            //             }
            //         };
            //     }

            //     if (isRef) {
            //         if (isRef) {
            //             const relatedLabelField = key.replace(/Id$/, '') + '.Name';

            //             return {
            //                 label: key,
            //                 fieldName: relatedLabelField, // this is the correct field path
            //                 type: 'text',
            //                 editable: false,
            //                 sortable: key == this.sortByRelated ? true : false
            //             };
            //         }


            //     }
                
                
            //     // Default non-picklist and non-ref field
            //     return {
            //         label: key,
            //         fieldName: key,
            //         type: lowerType,
            //         editable: !nonEditable,
            //         sortable: key == this.sortByRelated ? true : false
            //     };
            // });
            // this.relatedColumns = columnPromises;
            // this.relatedColumns.push({
            //     label: 'View',
            //     type: 'button',
            //     typeAttributes: {
            //         label: 'Open',
            //         name: 'openRecord',
            //         variant: 'base'
            //     }
            // });    
            //     getRecords({ objectAPIName: this.relatedObjectSelected, fieldAPINames: this.relatedObjectFieldsSelected, recordId: rec, parentObjectName: this.objectSelected }).then((res => {
            //         let filtered = res;
            //         const flattenedRecords = filtered.map(record => {
            //         const flatRecord = { ...record };
            //         console.log('flatRecord', JSON.stringify(flatRecord));
            
            
            //         this.relatedFieldList.forEach(field => {
            //             if (field.includes('.')) {
            //                 const [rel, subField] = field.split('.');
            //                 flatRecord[field] = record[rel] && record[rel][subField] ? record[rel][subField] : '';
            //                 }
            //             });
            //             return flatRecord;
            //         });
            //     console.log('flattenedRecords', JSON.stringify(flattenedRecords));
                
            //     this.relatedRecords = [...flattenedRecords];
            //     //this.records = [...filtered];
            //     this.totalRelatedRecords = filtered.length;
            //     this.relatedPageSize = this.pageSizeOptions[0];
            //     this.relatedRecordPaginationHelper();
            //         //this.relatedRecordList = res;
            //         console.log('this.relatedRecordList',JSON.stringify(this.relatedRecordList));
            //     }));
            // }).catch(error => {
            //     console.log(error.message);
            // });
            // this.draftRelatedValues = [];

            getRecords({ objectAPIName: this.relatedObjectSelected, fieldAPINames: this.relatedObjectFieldsSelected, recordId: rec, parentObjectName: this.objectSelected }).then((res => {
                    let filtered = res;
                    const flattenedRecords = filtered.map(record => {
                    const flatRecord = { ...record };
                    console.log('flatRecord', JSON.stringify(flatRecord));
            
            
                    this.relatedFieldList.forEach(field => {
                        if (field.includes('.')) {
                            const [rel, subField] = field.split('.');
                            flatRecord[field] = record[rel] && record[rel][subField] ? record[rel][subField] : '';
                            }
                        });
                        return flatRecord;
                    });
                console.log('flattenedRecords', JSON.stringify(flattenedRecords));
                
                this.relatedRecords = [...flattenedRecords];
                //this.records = [...filtered];
                this.totalRelatedRecords = filtered.length;
                this.relatedPageSize = this.pageSizeOptions[0];
                this.relatedRecordPaginationHelper();
                    //this.relatedRecordList = res;
                    console.log('this.relatedRecordList',JSON.stringify(this.relatedRecordList));
                }));
                this.draftRelatedValues = [];
            }).catch(error => {
            console.log(error);
            this.draftRelatedValues = [];
            const event = new ShowToastEvent({
                title: 'Failure!',
                message: error.body.message,
                variant: 'Error'
            });
            this.dispatchEvent(event);
        });
    }
    

    handleRelatedCellChange(event) {
        this.draftRelatedValues = event.detail.draftValues; // Track the changes
        this.isEditing = true; // Show Save and Cancel buttons
        console.log('event.detail.draftValues',event.detail.draftValues);
    }


async handleFilteration(event) {
    this.showFilterPopUp = false;

    console.log('I am here', JSON.stringify(this.fieldEntries));
    const fieldApiNames = this.fieldEntries.map(item => item.fieldName);
    console.log(JSON.stringify(fieldApiNames));
    console.log(this.fieldsSelectedForFiltering);
    console.log('==>fistdataWithFieldNames', JSON.stringify(this.dataWithFieldNames));

    const dataWithFN = this.dataWithFieldNames;
    sessionStorage.setItem('parentObjectFieldsSelected', JSON.stringify(this.parentObjectFieldsSelected));

    try {
        const res = await getFieldNamesWithType({ sObjectApiName: this.objectSelected });

        const fieldNames = Object.keys(res).filter(val => this.parentObjectFieldsSelected.includes(val));

        const columnPromises = fieldNames.map(async (key) => {
        const lowerType = res[key].toLowerCase();
        const isPicklist = res[key] === 'PICKLIST';
        const isRef = res[key] === 'REFERENCE';

        let nonEditable = res[key] == 'DATETIME' || res[key] == 'DATE' || res[key] == 'TIME' || res[key] == 'ID' ? true : false; 
        let options = [];

        if (isPicklist) {
            options = await this.getPicklistOptionsForField(key);
            return {
                label: key,
                fieldName: key,
                type: 'picklist',
                editable: isPicklist ||  nonEditable ? false : true,
                sortable: key == this.sortedBy ? true : false,
                typeAttributes: {
                    placeholder: 'Select value',
                    options: options,
                    label: key,
                    value: { fieldName: key },
                    context: { fieldName: 'Id' },
                    editable: false
                },
                cellAttributes: {
                    class: { fieldName: key }
                }
            };
        }

        if (isRef) {
            if (isRef) {
                const relatedLabelField = key.replace(/Id$/, '') + '.Name';

                return {
                    label: key,
                    fieldName: relatedLabelField, // this is the correct field path
                    type: 'text',
                    editable: false,
                    sortable: key == this.sortedBy ? true : false
                };
            }


        }

        // Default non-picklist and non-ref field
        return {
            label: key,
            fieldName: key,
            type: lowerType,
            editable: !nonEditable,
            sortable: key == this.sortedBy ? true : false
        };
    });


        this.columns = await Promise.all(columnPromises);
        this.columns.push({
            label: 'View',
            type: 'button',
            typeAttributes: {
                label: 'Open',
                name: 'openRecord',
                variant: 'base'
            }
        });
        sessionStorage.setItem('columns', JSON.stringify(this.columns));

        console.log('==>columns', JSON.stringify(this.columns));
        console.log('==>dataWithFieldNames', JSON.stringify(dataWithFN));
        this.fieldList = this.columns.filter(col => col.type !== 'button' && col.fieldName).map(col => col.fieldName);
        console.log('==>fieldList', JSON.stringify(this.fieldList));
        
        sessionStorage.setItem('columnList', JSON.stringify(this.fieldList));
        // Fetch filtered records
        const filtered = await getFilteredRecords({
            objectAPIName: this.objectSelected,
            fieldName: this.fieldList,
            mapOfFilteringVal: dataWithFN
        });
        console.log('filtered', filtered);
        
        this.filteredRecords = filtered;
        if (this.filteredRecords.length > 0) {
            this.showData = true;
        }
        console.log(JSON.stringify(filtered));
        
        this.showError = !this.showData && this.parentObjectFieldsSelected;
        const flattenedRecords = filtered.map(record => {
    const flatRecord = { ...record };
    console.log('flatRecord', JSON.stringify(flatRecord));
    
    
    this.fieldList.forEach(field => {
        if (field.includes('.')) {
            const [rel, subField] = field.split('.');
            flatRecord[field] = record[rel] && record[rel][subField] ? record[rel][subField] : '';
        }
    });
    return flatRecord;
});
console.log('flattenedRecords', JSON.stringify(flattenedRecords));

this.records = [...flattenedRecords];
        if(this.records.length == 0){
            this.showError = true;
        }
        //this.records = [...filtered];
        this.totalRecords = filtered.length;
        this.pageSize = this.pageSizeOptions[0];
        this.paginationHelper();

        console.log('filteredRecords', this.filteredRecords);
        console.log('===>this.showData', this.showData);
        console.log('records', JSON.stringify(this.records));
    } catch (error) {
        console.error('Error:', error);
    }

    // Step 3: Reset local states
    this.dataWithFieldNamesRestore = this.dataWithFieldNames;
    sessionStorage.setItem('dataWithFieldNamesRestore', JSON.stringify(this.dataWithFieldNamesRestore));

    this.dataWithFieldNames = [];
    this.relatedRecordList = [];
    this.rowsSelected = [];
    this.showRelatedData = false;
}

    getPicklistOptionsForField(fieldName) {
    return getFieldTypes({
        objectApiName: this.objectSelected,
        fieldApiNames: fieldName
    }).then((res) => {
        console.log('getPicklistOptionsForField', JSON.stringify(res[fieldName].FieldType));
        if (res[fieldName].FieldType === 'PICKLIST') {
            console.log('res[fieldName]', res[fieldName].Picklist);
            return res[fieldName].Picklist.map(val => ({
                label: val,
                value: val
            }));
        } else {
            return [];
        }
    });
}

    getPicklistRelatedOptionsForField(fieldName) {
        console.log('Ia mfesestestse');
        
    return getFieldTypes({
        objectApiName: this.relatedObjectSelected,
        fieldApiNames: fieldName
    }).then((res) => {
        console.log('getPicklistOptionsForField', JSON.stringify(res[fieldName].FieldType));
        if (res[fieldName].FieldType == 'PICKLIST') {
            console.log('res[fieldName]', res[fieldName].Picklist);
            return res[fieldName].Picklist.map(val => ({
                label: val,
                value: val
            }));
        } else {
            return [];
        }
    });
}



    handleFilterClick(event){
        this.showFilterPopUp = true;
        this.storeFieldSelectedAndType = false;
    }
    handleFilterClose(event){
        this.showFilterPopUp = false;
    }

    handleValueChange(event) {  
        event.stopPropagation(); 
        let dataRecieved = event.detail.data;
        let updatedItem;  
        let labelVal = dataRecieved.label;
        console.log(JSON.stringify(event.detail));
        console.log(JSON.stringify(dataRecieved.label));
        updatedItem = {
            Id: dataRecieved.context,
            [labelVal]: dataRecieved.value
        };
        this.setClasses(dataRecieved.context,labelVal,'slds-cell-edit slds-is-edited');
        this.updateDraftValues(updatedItem);
        this.updateDataValues(updatedItem);
    }

    handleRelatedValueChange(event) {  
        event.stopPropagation(); 
        let dataRecieved = event.detail.data;
        let updatedItem;  
        let labelVal = dataRecieved.label;
        console.log('event.detail',JSON.stringify(event.detail));
        console.log('dataRecieved.label)',JSON.stringify(dataRecieved.label));
        updatedItem = {
            Id: dataRecieved.context,
            [labelVal]: dataRecieved.value
        };
        this.setRelatedClasses(dataRecieved.context,labelVal,'slds-cell-edit slds-is-edited');
        this.updateRelatedDraftValues(updatedItem);
        this.updateRelatedDataValues(updatedItem);
    }

    updateDataValues(updateItem) {
        
        let copyData = JSON.parse(JSON.stringify(this.records));
        copyData.forEach((item) => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
        this.records = [...copyData];
    }

    updateRelatedDataValues(updateItem) {
        
        let copyData = JSON.parse(JSON.stringify(this.relatedRecords));
        console.log('copyData',JSON.stringify(copyData));
        
        copyData.forEach((item) => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
        this.relatedRecords = [...copyData];
    }

    updateDraftValues(updateItem) {
        
        let draftValueChanged = false;
        let copyDraftValues = JSON.parse(JSON.stringify(this.draftValues));
        copyDraftValues.forEach((item) => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
      
    }

    updateRelatedDraftValues(updateItem) {
        
        let draftValueChanged = false;
        let copyDraftValues = JSON.parse(JSON.stringify(this.draftRelatedValues));
        copyDraftValues.forEach((item) => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
        
        if (draftValueChanged) {
            this.draftRelatedValues = [...copyDraftValues];
        } else {
            this.draftRelatedValues = [...copyDraftValues, updateItem];
             console.log('draftRelatedValues', JSON.stringify(this.draftRelatedValues));
        }
      
    }

    setClasses(id, fieldName, fieldValue) {
        this.records = JSON.parse(JSON.stringify(this.records));
        console.log('rec', JSON.stringify(this.records));
        
        this.records.forEach((detail) => {
            if (detail.Id === id) {
                detail[fieldName] = fieldValue;
            }
        });
    }

    setRelatedClasses(id, fieldName, fieldValue) {
        this.relatedRecords = JSON.parse(JSON.stringify(this.relatedRecords));
        console.log('rec', JSON.stringify(this.relatedRecords));
        
        this.relatedRecords.forEach((detail) => {
            if (detail.Id === id) {
                detail[fieldName] = fieldValue;
            }
        });
    }

    handleEdit(event) {
        console.log('handleEdit dataRecieved:::',event.detail.data);
        event.preventDefault();
        let dataRecieved = event.detail.data;
        this.handleClickOnWindow(dataRecieved.context);
        
            this.setClasses(dataRecieved.context,'stageClass','slds-cell-edit');
            
    }

    handleLookupSelected(event) {
        console.log('I am xraeaedadadsad');
        event.stopPropagation(); 
        console.log('handleLookupSelected dataRecieved:::',event.detail.data);
        
        
    const { context, fieldName, value } = event.detail.data;
    const index = this.filteredRecords.findIndex(row => row.Id === context);
    
    if (index !== -1) {
        this.filteredRecords[index][fieldName] = value;
        this.filteredRecords = [...this.filteredRecords]; // trigger re-render
    }
}   

    handleAssignMe(event){
        console.log('rowSelec', JSON.stringify(this.rowsSelected));
        console.log('userId',this.userId);
        console.log('objectSelected',this.objectSelected);
        if(this.rowsSelected.length == 0){
                const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select atleast one record' ,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
        }
        if (this.rowsSelected.length > 0) {
            assignRecordToSelf({recordId: this.rowsSelected, userId: this.userId, objectAPIName: this.objectSelected}).then(_result => {
            const toastEvent = new ShowToastEvent({
                title: 'Success',
                message: 'Record is assigned to you',
                variant: 'success'
            });
            this.dispatchEvent(toastEvent);
            }).catch(_error => {
                    const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: 'There was an error assigning record to self. Please try again later.' ,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
        }
    }

    handleRelatedRecAssignMe(event){
        console.log('rowSelec', JSON.stringify(this.rowsRelSelected));
        console.log('userId',this.userId);
        
        console.log('relatedObjectSelected',this.relatedObjectSelected);
        
            if(this.rowsRelSelected.length == 0){
                const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select atleast one related record' ,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            }
        
        if(this.rowsRelSelected.length > 0){
            assignRecordToSelf({recordId: this.rowsRelSelected, userId: this.userId, objectAPIName: this.relatedObjectSelected}).then(_result => {
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record is assigned to you',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
            }).catch(_error => {
                    const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: 'There was an error assigning record to self. Please try again later.' ,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'openRecord') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    actionName: 'view'
                }
            });
        }
    }

    handleRelatedRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'openRecord') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    actionName: 'view'
                }
            });
        }
    }

}