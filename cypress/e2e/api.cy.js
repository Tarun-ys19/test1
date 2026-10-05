describe('REST API',()=>{
 it('rejects invalid login',()=>cy.request({method:'POST',url:`${Cypress.env('apiUrl')}/auth/login`,body:{email:'bad@example.com',password:'wrong'},failOnStatusCode:false}).its('status').should('eq',401));
 it('lists doctors publicly',()=>cy.request(`${Cypress.env('apiUrl')}/doctors`).its('status').should('eq',200));
 it('requires authentication for appointments',()=>cy.request({url:`${Cypress.env('apiUrl')}/appointments`,failOnStatusCode:false}).its('status').should('eq',401));
 it('validates registration fields',()=>cy.request({method:'POST',url:`${Cypress.env('apiUrl')}/auth/register`,body:{name:'',email:'not-an-email',password:'x'},failOnStatusCode:false}).its('status').should('eq',400));
 it('lists appointment availability for a doctor',()=>cy.request(`${Cypress.env('apiUrl')}/doctors`).then(({body})=>{if(body.length)cy.request(`${Cypress.env('apiUrl')}/appointments/slots?doctor=${body[0]._id}&date=2030-06-15`).its('status').should('eq',200)}));
 it('returns protected resource lists to an authenticated patient',()=>cy.request({method:'POST',url:`${Cypress.env('apiUrl')}/auth/login`,body:{email:'patient@smartcare.com',password:'SmartCare123!'}}).then(({body})=>{const h={Authorization:`Bearer ${body.token}`};cy.request({url:`${Cypress.env('apiUrl')}/prescriptions`,headers:h}).its('status').should('eq',200);cy.request({url:`${Cypress.env('apiUrl')}/medicines`,headers:h}).its('status').should('eq',200);cy.request({url:`${Cypress.env('apiUrl')}/lab-reports`,headers:h}).its('status').should('eq',200)}));
});
