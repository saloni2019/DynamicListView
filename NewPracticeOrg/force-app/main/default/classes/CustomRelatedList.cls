public class CustomRelatedList {
    @AuraEnabled(cacheable=true)
    public static List<String> getChildObjects () {
        try{
        Schema.DescribeSObjectResult R = Account.SObjectType.getDescribe();
        List<String> childObjects = new List<String>();

        for (Schema.ChildRelationship cr: R.getChildRelationships()) {
            if (cr.getRelationshipName() == null) continue;
            childObjects.add(cr.getChildSObject().getDescribe().getName());           
        }
       
        return childObjects;
        } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static List<String> getChildFieldNames (String sObjectApiName) {
        try{
        List<String> childFieldNames = new List<String>();
        
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map<String, Schema.SObjectField> fieldMap = schemaMap.get(sObjectApiName).getDescribe().fields.getMap();
        for(String fieldName : fieldMap.keyset() )
        {
            Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
            
            childFieldNames.add(fieldMap.get(fieldName).getDescribe().getName());
        }
        return childFieldNames;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static List<String> getChildFieldNamesForFilteration (String sObjectApiName) {
        try{
        List<String> childFieldNames = new List<String>();
        
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map<String, Schema.SObjectField> fieldMap = schemaMap.get(sObjectApiName).getDescribe().fields.getMap();
        for(String fieldName : fieldMap.keyset() )
        {
            Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
            String type = fieldDescribe.getType().name();
            if(type != 'TextArea'){
                childFieldNames.add(fieldMap.get(fieldName).getDescribe().getName());
            }
        }
        return childFieldNames;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static Map<String, String> getFieldNamesWithType (String sObjectApiName) {
        try{
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        List<String> childFieldNames = new List<String>();
        Schema.SObjectType leadSchema = schemaMap.get(sObjectApiName);
        Map<String, Schema.SObjectField> fieldMap = leadSchema.getDescribe().fields.getMap();
        Map<String, String> records = new Map<String, String>();
        
        for (String fieldName: fieldMap.keySet()) {
            Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
            records.put(fieldMap.get(fieldName).getDescribe().getName(), String.valueOf(fielddataType));
        }
       
        return records;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static List<sObject> getRecords(String objectAPIName, String[] fieldAPINames, String recordId, String parentObjectName){
        try {
        
        String query = 'Select ' + String.join(fieldAPINames, ', ')+ ' FROM ' + objectAPIName + ' WHERE ' +parentObjectName+ '.Id ' + '=' + '\''+ recordId + '\'';
        System.debug('query'+query);
        return Database.query(query);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

   @AuraEnabled
   public static List<List<sObject>> searchRecords(String searchTerm, String objectAPIName, String columnNames){
    try {
      String query = 'FIND {' + searchTerm + '} IN ALL FIELDS RETURNING ' + objectAPIName + '(' + columnNames + ')';
      System.debug(query);
      return search.query(query);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

   @AuraEnabled
   public static List<List<sObject>> relatedObjectSearchRecords(String searchTerm, String objectAPIName, String columnNames, String parentObject){
    try {
      String relatedFields = columnNames + ' WHERE ' + parentObject + '.Id';
      String query = 'FIND {' + searchTerm + '} IN ALL FIELDS RETURNING ' + objectAPIName + '(' + relatedFields + ')';
      
      return search.query(query);
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }

   @AuraEnabled
   public static void updateRecords(List<Map<String, Object>> recordsToUpdate, String recordObject){
    try {
        List<sObject> updateList = new List<sObject>();
        
        for(Map<String, Object> fieldDetailsMap: recordsToUpdate) {
         
            
            Schema.SObjectType targetType = Schema.getGlobalDescribe().get(recordObject);
            
            Sobject accountObj = targetType.newSObject();
            
            for(String fieldName: fieldDetailsMap.keySet())
            {
                accountObj.put(fieldName, fieldDetailsMap.get(fieldName));
            }
            
            updateList.add(accountObj);
        }
        if (!updateList.isEmpty()) {
            update updateList;
        }
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }
}