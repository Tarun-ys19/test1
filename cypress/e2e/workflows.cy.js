describe('Role workflows',()=>{
 const api=Cypress.env('apiUrl'),password='SmartCare123!';
 const login=email=>cy.request('POST',`${api}/auth/login`,{email,password});
 it('doctor writes prescription, patient views it, pharmacy dispenses',()=>{
  login('doctor@smartcare.com').then(({body:doctor})=>login('patient@smartcare.com').then(({body:patient})=>{
   const request={method:'POST',url:`${api}/prescriptions`,headers:{Authorization:`Bearer ${doctor.token}`},body:{patient:patient.user._id,diagnosis:'Clinician entered test note',medicines:[{name:'Cypress Demo Medicine',dosage:'1 tablet',frequency:'daily',duration:'3 days'}]}};
   cy.request(request).then(({body:rx})=>{expect(rx.status).to.eq('Pending');cy.request({url:`${api}/prescriptions`,headers:{Authorization:`Bearer ${patient.token}`}}).then(({body:list})=>expect(list.some(item=>item._id===rx._id)).to.eq(true));login('pharmacy@smartcare.com').then(({body:pharmacist})=>cy.request({method:'PUT',url:`${api}/prescriptions/${rx._id}/dispense`,headers:{Authorization:`Bearer ${pharmacist.token}`}}).its('body.status').should('eq','Dispensed'))});
  }));
 });
 it('lab staff accepts and completes a doctor requested test',()=>{
  login('doctor@smartcare.com').then(({body:doctor})=>login('patient@smartcare.com').then(({body:patient})=>cy.request({method:'POST',url:`${api}/lab-reports`,headers:{Authorization:`Bearer ${doctor.token}`},body:{patient:patient.user._id,testName:`Cypress Panel ${Date.now()}`}}).then(({body:report})=>login('lab@smartcare.com').then(({body:lab})=>{
   const headers={Authorization:`Bearer ${lab.token}`};return cy.request({method:'PUT',url:`${api}/lab-reports/${report._id}`,headers,body:{status:'Accepted'}}).then(()=>cy.request({method:'PUT',url:`${api}/lab-reports/${report._id}`,headers,body:{status:'Completed',result:'Within reference range'}}).its('body.status').should('eq','Completed'));
  }))));
 });
 it('pharmacist adds a medicine and sees stock alerts',()=>login('pharmacy@smartcare.com').then(({body})=>{
  const name=`Cypress Stock ${Date.now()}`,headers={Authorization:`Bearer ${body.token}`};return cy.request({method:'POST',url:`${api}/medicines`,headers,body:{name,quantity:1,price:2.5,lowStockThreshold:2}}).then(()=>cy.request({url:`${api}/medicines/alerts`,headers}).then(({body:alerts})=>expect(alerts.some(a=>a.medicine===name&&a.type==='low-stock')).to.eq(true)));
 }));
 it('admin manages staff accounts and patient cannot access user management',()=>login('admin@smartcare.com').then(({body:admin})=>{
  const headers={Authorization:`Bearer ${admin.token}`},email=`cypress-staff-${Date.now()}@example.test`;return cy.request({method:'POST',url:`${api}/users`,headers,body:{name:'Cypress Staff',email,password,role:'lab'}}).then(({body:user})=>cy.request({method:'DELETE',url:`${api}/users/${user._id}`,headers})).then(()=>login('patient@smartcare.com')).then(({body:patient})=>cy.request({url:`${api}/users`,headers:{Authorization:`Bearer ${patient.token}`},failOnStatusCode:false}).its('status').should('eq',403));
 }));
 it('receptionist creates a bill and administrator records payment',()=>login('reception@smartcare.com').then(({body:reception})=>login('patient@smartcare.com').then(({body:patient})=>cy.request({method:'POST',url:`${api}/payments`,headers:{Authorization:`Bearer ${reception.token}`},body:{patient:patient.user._id,amount:42.5,method:'Card',status:'Pending'}}).then(({body:payment})=>login('admin@smartcare.com').then(({body:admin})=>cy.request({method:'PUT',url:`${api}/payments/${payment._id}/status`,headers:{Authorization:`Bearer ${admin.token}`},body:{status:'Paid'}}).its('body.status').should('eq','Paid'))))));
});
