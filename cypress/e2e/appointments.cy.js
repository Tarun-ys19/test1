describe('Appointments and queue',()=>{
 const api=Cypress.env('apiUrl');
 const login=email=>cy.request('POST',`${api}/auth/login`,{email,password:'SmartCare123!'});
 it('shows available doctors and books an available slot in the UI',()=>{
  cy.visit('/');cy.get('input[type=email]').type('patient@smartcare.com');cy.get('input[type=password]').type('SmartCare123!');cy.contains('Sign in').click();cy.get('.sidebar nav').contains('Appointments').click();
  cy.get('select[name=doctor]').select(1);cy.get('select').eq(1).find('option').should('have.length.greaterThan',1);cy.get('select').eq(1).select(1);cy.get('input[name=reason]').type('Cypress appointment');cy.contains('Book appointment').click();cy.contains('Appointment booked').should('be.visible');
 });
 it('rejects invalid appointment payloads',()=>login('patient@smartcare.com').then(({body})=>cy.request({method:'POST',url:`${api}/appointments`,headers:{Authorization:`Bearer ${body.token}`},body:{},failOnStatusCode:false}).its('status').should('eq',400)));
 it('reschedules an appointment to another open slot and cancels it',()=>login('patient@smartcare.com').then(({body:patient})=>cy.request(`${api}/doctors`).then(({body:doctors})=>{const day=new Date(Date.now()+60*86400000).toISOString().slice(0,10),headers={Authorization:`Bearer ${patient.token}`};cy.request(`${api}/appointments/slots?doctor=${doctors[0]._id}&date=${day}`).then(({body:slots})=>{expect(slots.length).to.be.greaterThan(1);cy.request({method:'POST',url:`${api}/appointments`,headers,body:{doctor:doctors[0]._id,date:slots[0],reason:'Reschedule test'}}).then(({body:appt})=>cy.request({method:'PUT',url:`${api}/appointments/${appt._id}`,headers,body:{date:slots[1]}}).then(({body:changed})=>{expect(new Date(changed.date).toISOString()).to.eq(new Date(slots[1]).toISOString());cy.request({method:'DELETE',url:`${api}/appointments/${appt._id}`,headers}).its('body.message').should('eq','Appointment cancelled')}))})})));
 it('prevents duplicate booking and supports QR check-in and queue assignment',()=>{
  login('patient@smartcare.com').then(({body:patient})=>login('doctor@smartcare.com').then(({body:doctor})=>cy.request(`${api}/doctors`).then(({body:doctors})=>{
   const day=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   cy.request(`${api}/appointments/slots?doctor=${doctors[0]._id}&date=${day}`).then(({body:slots})=>{
    expect(slots.length).to.be.greaterThan(0);const payload={doctor:doctors[0]._id,date:slots[0],reason:'Queue test'};
    cy.request({method:'POST',url:`${api}/appointments`,headers:{Authorization:`Bearer ${patient.token}`},body:payload}).then(({body:appt})=>{
     cy.request({url:`${api}/appointments/${appt._id}/qr`,headers:{Authorization:`Bearer ${patient.token}`}}).its('body.qrDataUrl').should('include','data:image/png;base64,');
     cy.request({method:'POST',url:`${api}/appointments`,headers:{Authorization:`Bearer ${patient.token}`},body:payload,failOnStatusCode:false}).its('status').should('eq',409);
     cy.request({method:'POST',url:`${api}/checkin/${appt.checkinToken}`,headers:{Authorization:`Bearer ${patient.token}`}}).its('body.status').should('eq','Checked In');
     cy.request({url:`${api}/queue`,headers:{Authorization:`Bearer ${doctor.token}`}}).then(({status,body:queue})=>{expect(status).to.eq(200);expect(queue.some(q=>q.appointment._id===appt._id)).to.eq(true)});
     cy.request({method:'POST',url:`${api}/appointments/${appt._id}/call`,headers:{Authorization:`Bearer ${doctor.token}`}}).its('body.status').should('eq','In Consultation');
    });
   });
  })));
 });
});
