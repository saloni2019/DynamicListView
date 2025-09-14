public with sharing class fetchDynamicData {

    @AuraEnabled(cacheable=true)
    public static List<String> getObjects(){
        List<String> objectMap = new List<String>();
        for(Schema.SObjectType objTyp : Schema.getGlobalDescribe().Values()){
           String name = objTyp.getDescribe().getName();
           String label = objTyp.getDescribe().getLabel();
           if(!name.containsignorecase('history') && !name.containsignorecase('tag') &&
                !name.containsignorecase('share') && !name.containsignorecase('feed') && 
               	!name.containsignorecase('group') && !name.containsignorecase('public') &&
                !objTyp.getDescribe().isCustomSetting() && objTyp.getDescribe().isCreateable() &&
                objTyp.getDescribe().getRecordTypeInfos().size() > 0){      
                objectMap.add(name);
           }
        }
		System.debug(objectMap);
        if(objectMap != null && objectMap.size() > 0){
            objectMap.sort();
        	return objectMap;   
        }else{
            return null;
        }
    }

    @AuraEnabled
    public static List<String> getChildObjects (String sObjectType) {
        try{
            Schema.SObjectType sObjectTypeRef = Schema.getGlobalDescribe().get(sObjectType);
        
            if (sObjectTypeRef == null) {
                throw new IllegalArgumentException('Invalid SObject type: ' + sObjectType);
            }
            
            Schema.DescribeSObjectResult describeResult = sObjectTypeRef.getDescribe();
            List<String> childObjects = new List<String>();
    
            for (Schema.ChildRelationship cr : describeResult.getChildRelationships()) {
                if (cr.getRelationshipName() == null) continue;
                childObjects.add(cr.getChildSObject().getDescribe().getName());
            }
    
            return childObjects;
        } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static List<sObject> getObjectRecords(String objectAPIName, String[] fieldAPINames, String userId){
        try {
        
        String query = 'Select ' + String.join(fieldAPINames, ', ')+ ' FROM ' + objectAPIName + ' WHERE ' +'CreatedById'+ '=' + '\''+ userId + '\'' +' OR '+'OwnerId'+ '=' + '\''+ userId + '\'';
        
        return Database.query(query);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

   @AuraEnabled
    public static List<sObject> getRecords(String objectAPIName, String[] fieldAPINames, String[] recordId, String parentObjectName){
        try {
        System.debug('recordId'+recordId);
        List<String> recordsIdString = new List<String>();
        for(String ids: recordId){
            recordsIdString.add('\'' + ids + '\'');
        }
        String query = 'Select ' + String.join(fieldAPINames, ', ')+ ' FROM ' + objectAPIName + ' WHERE ' +parentObjectName+ '.Id ' + 'IN' +recordsIdString;
        System.debug('query'+query);
        return Database.query(query);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

    /*@AuraEnabled(cacheable=true)
    public static Map<String, String> getFieldTypes(String objectApiName, List<String> fieldApiNames) {
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();
        Map<String, String> fieldTypes = new Map<String, String>();

        for (String fieldName : fieldApiNames) {
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                fieldTypes.put(fieldName, fieldDescribe.getType().name()); // Like: STRING, DATE, PICKLIST
            }
        }
        return fieldTypes;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(String objectApiName, String fieldApiName) {
        List<String> values = new List<String>();
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectApiName);
        if (objType != null) {
            Schema.DescribeSObjectResult objDesc = objType.getDescribe();
            Schema.DescribeFieldResult fieldDesc = objDesc.fields.getMap().get(fieldApiName).getDescribe();
            for (Schema.PicklistEntry entry : fieldDesc.getPicklistValues()) {
                values.add(entry.getLabel());
            }
        }
        return values;
    }*/

    @AuraEnabled
    public static Map<String, Object> getFieldTypes(String objectApiName, List<String> fieldApiNames) {
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();
        Map<String, Object> fieldTypeAndPickListVal = new Map<String, Object>();
        Map<String, Object> details = new Map<String, Object>();
        for (String fieldName : fieldApiNames) {
            details = new Map<String, Object>();
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                String type = fieldDescribe.getType().name();
                
                details.put('FieldType', fieldDescribe.getType().name()); // Like: STRING, DATE, PICKLIST

                if(type == 'PICKLIST'){
                    List<String> picklistValues = new List<String>();
                    for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                        picklistValues.add(entry.getLabel());
                    }
                    details.put('Picklist', picklistValues);
                }
                fieldTypeAndPickListVal.put(fieldName, details);
            }
        }
        return fieldTypeAndPickListVal;
    }

    @AuraEnabled
    public static Map<String, Object> getFieldsWithDetails(String objectApiName, List<String> fieldApiNames) {
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();
        Map<String, Object> fieldDetails = new Map<String, Object>();

        for (String fieldName : fieldApiNames) {
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                String type = fieldDescribe.getType().name();
                Map<String, Object> details = new Map<String, Object>();
                details.put('type', type);

                if (type == 'PICKLIST') {
                    List<String> picklistValues = new List<String>();
                    for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                        picklistValues.add(entry.getLabel());
                    }
                    details.put('values', picklistValues);
                } else {
                    details.put('values', new List<String>());
                }

                fieldDetails.put(fieldName, details);
            }
        }
        return fieldDetails;
    }

    @AuraEnabled
    public static List<sObject> getFilteredRecords(String objectAPIName, List<String> fieldName, Map<String, Object> mapOfFilteringVal){
        String fields = String.join(fieldName, ',');
        List<String> conditions = new List<String>();
        System.debug('fields'+fields);
        for (String key : mapOfFilteringVal.keySet()) {
            Object rawValue = mapOfFilteringVal.get(key);
            System.debug(rawValue instanceOf String);
            if(rawValue instanceOf String && !Pattern.matches('\\d{4}-\\d{2}-\\d{2}', String.valueOf(rawValue))){
                String value = (String)mapOfFilteringVal.get(key);
                // Escape single quotes in value
                value = '%'+value.replace('\'', '\\\'')+'%';
                conditions.add(key + ' LIKE \'' + value + '\'');   
            }else if(rawValue instanceOf Boolean){
                Boolean value = (Boolean)mapOfFilteringVal.get(key);
                // Escape single quotes in value
                conditions.add(key + ' = ' + value);
            }else if(rawValue instanceOf Decimal){
                Decimal value = (Decimal)mapOfFilteringVal.get(key);
                // Escape single quotes in value
                conditions.add(key + ' = ' + value);
            }else if(rawValue instanceOf Integer){
                Integer value = (Integer)mapOfFilteringVal.get(key);
                // Escape single quotes in value
                conditions.add(key + ' = ' + value);
            }else if(rawValue instanceOf Double){
                Double value = (Double)mapOfFilteringVal.get(key);
                // Escape single quotes in value
                conditions.add(key + ' = ' + value);
            }else if (rawValue instanceof String && Pattern.matches('\\d{4}-\\d{2}-\\d{2}', String.valueOf(rawValue))) {
                String rawStr = String.valueOf(rawValue).trim();
                Date value = Date.valueOf(rawStr); // Valid date check
                String formattedDate = value.year() + '-' +
                                    (value.month() < 10 ? '0' : '') + value.month() + '-' +
                                    (value.day() < 10 ? '0' : '') + value.day();
                conditions.add('DAY_ONLY(' + key + ') = ' + formattedDate);
            }
        }
        String whereClause = String.join(conditions, ' AND ');
        String query = 'SELECT '+ fields+ ' FROM Account '+ 'WHERE ' + whereClause;
        System.debug(query);
        System.debug(Database.query(query));
        return Database.query(query);
    }

    @AuraEnabled
    public static String getReferenceObjectName(String objectAPIName, String fieldAPIName){
        try {
            Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectAPIName).getDescribe().fields.getMap();
            String referenceObjectName;
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldAPIName).getDescribe();
            if (fieldDescribe.getType() == Schema.DisplayType.REFERENCE) {        
                List<Schema.SObjectType> referenceTo = fieldDescribe.getReferenceTo();
                if (!referenceTo.isEmpty()) {
                    referenceObjectName = String.valueOf(referenceTo[0]);
                }
            }
            
            return referenceObjectName;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static List<String> getChildFieldsReferencingParent(String childObjectName, String parentObjectName) {
        List<String> matchingFields = new List<String>();

        // Get child object type
        Schema.SObjectType childType = Schema.getGlobalDescribe().get(childObjectName);
        if (childType == null) return matchingFields;

        Schema.DescribeSObjectResult childDescribe = childType.getDescribe();
        Map<String, Schema.SObjectField> childFields = childDescribe.fields.getMap();

        for (String fieldName : childFields.keySet()) {
            Schema.DescribeFieldResult fieldDesc = childFields.get(fieldName).getDescribe();

            if (fieldDesc.getType() == Schema.DisplayType.REFERENCE) {
                for (Schema.SObjectType refType : fieldDesc.getReferenceTo()) {
                    String refObjectName = refType.getDescribe().getName();

                    if (refObjectName == parentObjectName && fieldDesc.isAccessible()) {
                        matchingFields.add(fieldName);  // Only child-side field name, e.g., AccountId
                    }
                }
            }
        }

        return matchingFields;
    }

    @AuraEnabled
    public static List<String> getChildFieldNamesForRefFilteration (String sObjectApiName) {
        try{
            List<String> childFieldNames = new List<String>();
            
            Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            Map<String, Schema.SObjectField> fieldMap = schemaMap.get(sObjectApiName).getDescribe().fields.getMap();
            for(String fieldName : fieldMap.keyset() )
            {
                Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                String type = fieldDescribe.getType().name();
                if(type == 'String' || type == 'Phone' || type == 'Email' || type == 'Id' || type == 'Picklist' || type == 'URL'){
                    childFieldNames.add(fieldMap.get(fieldName).getDescribe().getName());
                }
            }
            return childFieldNames;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
public static Map<String, Object> getFieldNamesWithTypeAndPicklist(String sObjectApiName) {
    Map<String, Object> fieldMap = new Map<String, Object>();
    Schema.SObjectType objType = Schema.getGlobalDescribe().get(sObjectApiName);
    if (objType == null) return fieldMap;

    Map<String, Schema.SObjectField> fields = objType.getDescribe().fields.getMap();
    for (String fieldName : fields.keySet()) {
        Schema.DescribeFieldResult fieldDescribe = fields.get(fieldName).getDescribe();
        Map<String, Object> fieldInfo = new Map<String, Object>();
        fieldInfo.put('FieldType', fieldDescribe.getType().name());

        if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
            List<String> picklistValues = new List<String>();
            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                picklistValues.add(entry.getLabel());
            }
            fieldInfo.put('Picklist', picklistValues);
        }

        fieldMap.put(fieldName, fieldInfo);
    }

    return fieldMap;
}

    @AuraEnabled
public static List<SObject> searchLookupRecords(String objectApiName, String searchKey) {
    String searchKeywd = '%' + searchKey + '%';
    
    // Dynamically build the query string without using bind variables inside the string
    String query = 'SELECT Id, Name FROM ' + String.escapeSingleQuotes(objectApiName) +
                   ' WHERE Name LIKE \'' + String.escapeSingleQuotes(searchKeywd) + '\'';

    System.debug(query);
    return Database.query(query);
}

    @AuraEnabled
    public static void assignRecordToSelf(List<String> recordId, String userId, String objectAPIName){
        if (recordId == null || recordId.isEmpty() || String.isBlank(userId) || String.isBlank(objectAPIName)) {
            return;
        }

        String idListStr = '';
        for (String id : recordId) {
            idListStr += '\'' + String.escapeSingleQuotes(id) + '\',';
        }
        idListStr = idListStr.removeEnd(',');

        String query = 'SELECT Id FROM ' + objectAPIName + ' WHERE Id IN (' + idListStr + ')';

        List<sObject> records = Database.query(query);

        List<sObject> updatedRecords = new List<sObject>();
        Map<String, Schema.SObjectType> globalDesc = Schema.getGlobalDescribe();

        if (!globalDesc.containsKey(objectAPIName)) {
            throw new AuraHandledException('Invalid object API name: ' + objectAPIName);
        }

        Schema.SObjectType sObjType = globalDesc.get(objectAPIName);
        for (sObject rec : records) {
            Id recId = (Id) rec.get('Id'); 
            sObject updated = sObjType.newSObject(recId);
            
            updated.put('OwnerId', userId);
            updatedRecords.add(updated);
        }

        if (!updatedRecords.isEmpty()) {
            update updatedRecords;
        }
        
    }
        

}