describe('Authentication',()=>{
 const api=Cypress.env('apiUrl');
 it('shows a useful error for invalid credentials',()=>{cy.visit('/');cy.contains('Welcome back');cy.get('input[type=email]').type('missing@smartcare.com');cy.get('input[type=password]').type('wrongpass');cy.contains('Sign in').click();cy.contains('Email or password is incorrect')});
 it('logs in a patient and signs out',()=>{cy.visit('/');cy.get('input[type=email]').type('patient@smartcare.com');cy.get('input[type=password]').type('SmartCare123!');cy.contains('Sign in').click();cy.contains('Your care at a glance');cy.get('[title="Sign out"]').click();cy.contains('Welcome back')});
 it('registers a patient account',()=>{const email=`patient-${Date.now()}@example.test`;cy.request('POST',`${api}/auth/register`,{name:'Cypress Patient',email,password:'SmartCare123!'}).its('status').should('eq',201);cy.request({method:'POST',url:`${api}/auth/register`,body:{name:'Duplicate',email,password:'SmartCare123!'},failOnStatusCode:false}).its('status').should('eq',409)});
 it('rejects invalid and incomplete registration requests',()=>{cy.request({method:'POST',url:`${api}/auth/register`,body:{name:'',email:'bad',password:'x'},failOnStatusCode:false}).its('status').should('eq',400)});
 it('rejects patient access to admin operations',()=>{cy.request('POST',`${api}/auth/login`,{email:'patient@smartcare.com',password:'SmartCare123!'}).then(({body})=>cy.request({url:`${api}/admin/stats`,headers:{Authorization:`Bearer ${body.token}`},failOnStatusCode:false}).its('status').should('eq',403))});
});
