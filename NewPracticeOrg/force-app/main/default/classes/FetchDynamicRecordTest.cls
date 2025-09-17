@IsTest
public class FetchDynamicRecordTest {
    
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
    static void testgetObjects(){
        Test.startTest();
        List<String> objects = FetchDynamicRecord.getObjects();
        Test.stopTest();
        System.Assert.areNotEqual(null, objects, 'Objects list should not be null');
    }

    static testMethod void testGetChildObjects() {
        List<String> childObjects = FetchDynamicRecord.getChildObjects('Account');
        System.assert(childObjects.contains('Contact'), 'Contacts should be child of Account');
    }

    static testMethod void testGetObjectRecords() {
        Account acc = new Account(Name='Test Acc');
        insert acc;

        List<SObject> results = FetchDynamicRecord.getObjectRecords(
            'Account', 
            new String[]{'Id','Name'}, 
            UserInfo.getUserId()
        );
        System.assertNotEquals(0, results.size(), 'Should return at least one record');
    }

    static testMethod void testGetRecords() {
        Account acc = new Account(Name='Parent');
        insert acc;

        Contact con = new Contact(LastName='Child', AccountId=acc.Id);
        insert con;

        List<SObject> results = FetchDynamicRecord.getRecords(
            'Contact', 
            new String[]{'Id','LastName','AccountId'}, 
            new String[]{acc.Id}, 
            'Account'
        );
        System.assertEquals(1, results.size(), 'Should fetch child records');
    }

    static testMethod void testGetFieldTypes() {
        Map<String,Object> details = FetchDynamicRecord.getFieldTypes(
            'Account', new List<String>{'Name','Industry'}
        );
        System.assert(details.containsKey('Name'));
    }

    static testMethod void testGetFieldsWithDetails() {
        Map<String,Object> details = FetchDynamicRecord.getFieldsWithDetails(
            'Account', new List<String>{'Name','Industry'}
        );
        System.assert(details.containsKey('Name'));
    }

    static testMethod void testGetFilteredRecords() {
        Account acc = new Account(Name='FilterTest');
        insert acc;

        Map<String,Object> filter = new Map<String,Object>{ 'Name' => 'FilterTest' };
        List<SObject> results = FetchDynamicRecord.getFilteredRecords(
            'Account', new List<String>{'Id','Name'}, filter
        );
        System.assertEquals(1, results.size(), 'Should return filtered Account');
    }

    static testMethod void testGetReferenceObjectName() {
        String refObj = FetchDynamicRecord.getReferenceObjectName('Contact', 'AccountId');
        System.assertEquals('Account', refObj, 'AccountId should reference Account');
    }

    static testMethod void testGetChildFieldsReferencingParent() {
        List<String> fields = FetchDynamicRecord.getChildFieldsReferencingParent('Contact', 'Account');
    }

    static testMethod void testGetChildFieldNamesForRefFilteration() {
        List<String> fields = FetchDynamicRecord.getChildFieldNamesForRefFilteration('Account');
        System.assert(fields.contains('Name'), 'Name field should be returned');
    }

    static testMethod void testGetFieldNamesWithTypeAndPicklist() {
        Map<String,Object> details = FetchDynamicRecord.getFieldNamesWithTypeAndPicklist('Account');
    }

    static testMethod void testSearchLookupRecords() {
        Account acc = new Account(Name='LookupAcc');
        insert acc;

        List<SObject> results = FetchDynamicRecord.searchLookupRecords('Account', 'LookupAcc');
        System.assertNotEquals(0, results.size());
    }

    static testMethod void testAssignRecordToSelf() {
        Account acc = new Account(Name='AssignAcc');
        insert acc;

        FetchDynamicRecord.assignRecordToSelf(new List<String>{acc.Id}, UserInfo.getUserId(), 'Account');

        Account updated = [SELECT OwnerId FROM Account WHERE Id=:acc.Id];
        System.assertEquals(UserInfo.getUserId(), updated.OwnerId);
    }

}