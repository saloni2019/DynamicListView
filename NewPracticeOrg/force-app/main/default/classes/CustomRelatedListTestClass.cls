@IsTest
public class CustomRelatedListTestClass {
    @TestSetup
    static void makeData(){
        Account acc = new Account(Name = 'Test Account', Phone = '9999999999');
        insert acc;

        Contact con = new Contact();
        con.FirstName = 'Test';
        con.LastName = 'Class';
        con.AccountId = acc.Id;
        insert con;
    }

    @IsTest
    static void testGetChildObjects() {
        List<String> childObjects = CustomRelatedList.getChildObjects();
        System.assertNotEquals(null, childObjects, 'Child objects list should not be null');
    }

    @IsTest
    static void testGetChildFieldNames() {
        List<String> childFieldNames = CustomRelatedList.getChildFieldNames('Account');
        System.assertNotEquals(null, childFieldNames, 'Child field names list should not be null');
    }

    @IsTest
    static void testGetFieldNamesWithType() {
        Map<String, String> fieldNamesWithType = CustomRelatedList.getFieldNamesWithType('Account');
        System.assertNotEquals(null, fieldNamesWithType, 'Field names with type map should not be null');
    }

    @IsTest
    static void testGetRecords() {
       List<Account> accList = new List<Account>([Select Id from Account where Name = 'Test Account']);
        List<sObject> records = CustomRelatedList.getRecords('Contact', new String[]{'Id'}, accList[0].Id, 'Account');
        System.assertNotEquals(null, records, 'Records list should not be null');
    }

    @IsTest
    static void testSearchRecords() {
        List<List<sObject>> searchResults = CustomRelatedList.searchRecords('Test', 'Contact', 'Id');
        System.assertNotEquals(null, searchResults, 'Search results should not be null');
    }

    @IsTest
    static void testUpdateRecords() {
        List<Account> accList = new List<Account>([Select Id from Account where Name = 'Test Account']);

        List<Map<String, Object>> recordsToUpdate = new List<Map<String, Object>>();
        Map<String, Object> record = new Map<String, Object>();
        record.put('Id', accList[0].Id);
        record.put('Name', 'Updated Account Name');
        recordsToUpdate.add(record);

        Test.startTest();
        CustomRelatedList.updateRecords(recordsToUpdate, 'Account');
        Test.stopTest();

        Account updatedAcc = [SELECT Id, Name FROM Account WHERE Id = :accList[0].Id LIMIT 1];
        System.assertEquals('Updated Account Name', updatedAcc.Name, 'Account name should be updated');
    }

    @IsTest
    static void testgetChildFieldNamesForFilteration(){
        Test.startTest();
        List<String> childFieldNames = CustomRelatedList.getChildFieldNamesForFilteration('Account');
        Test.stopTest();
        System.Assert.areNotEqual(null, childFieldNames, 'Child field names list should not be null');
    }

    @isTest
    static void testRelatedObjectSearchRecords_Found() {
        Test.startTest();
        
        List<List<sObject>> results = CustomRelatedList.relatedObjectSearchRecords(
            'Class',              
            'Contact',                  
            'Id, LastName',             
            'Account',
            'AccountId != null'                  
        );
        
        Test.stopTest();
        
        System.assertNotEquals(0, results.size(), 'Results should not be empty');
    }
}