// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const express = require('express');


const engines = require('consolidate');

const admin = require('firebase-admin');

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var arr = {};
var arrJobs = {};
var arrInformation = {};
var arrBanner = {};
var arrIKAReg = {};
var arrAbout;


const serviceAccount = require("./ppk-uny-mobile-firebase-adminsdk-ohay0-5df4681e3c.json");
const { request, response } = require('express');
const { parse } = require('handlebars');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ppk-uny-mobile.firebaseio.com"
});

async function getCompaniesData(response){
    const admin_fire = admin.firestore();
    var i = 0;
    var x = 0;
    var z = 0;
    var y = 0;
    var k = 0;
    var a = 0;

    await admin_fire.collection('companies').orderBy('dateCreated', 'desc')
    .get().then(function(querySnapshot) {

        querySnapshot.forEach(function(doc){

            if(!doc.exists){
                console.log('No such document in companies!'); 
            }
            else{
                arr[i] = doc.data();
                console.log('else companies');
                i++;
            } 

        });
        }).catch(e => {
            console.log("error fetching data companies", e);
        })


    await admin_fire.collection('jobs').orderBy('dateCreated', 'desc')
    .get().then(function(querySnapshot) {

         querySnapshot.forEach(function(doc){
            
            if(!doc.exists){
                console.log('No such document! in jobs'); 
            }
            else{
                arrJobs[x] = doc.data();      
                console.log('BEFOREstartDate', arrJobs[x].startDate);
                console.log('AFTERendDate', arrJobs[x].endDate);
                arrJobs[x].startDate = arrJobs[x].startDate.toDate().toISOString().slice(0,-1);
                arrJobs[x].endDate =  arrJobs[x].endDate.toDate().toISOString().slice(0,-1);
             
                console.log('startDate', arrJobs[x].startDate);
                console.log('endDate', arrJobs[x].endDate);
                console.log('tanggal akhir', doc.data().endDate.toDate());
                console.log('tanggal Baru', new Date());
                if(doc.data().endDate.toDate() < new Date()){
                    console.log('yeaaay');
                    try{
                        insertFormJobInActive(admin_fire, arrJobs[x]);
                        admin_fire.collection('jobs').doc(arrJobs[x].jobID).delete();
                        admin_fire.collection('companies_jobs').doc(arrJobs[x].companyID).collection(arrJobs[x].companyID).doc(arrJobs[x].jobID).delete();
                    }    
                    catch(e){    
                        console.log('error deleting job', e);
                    } 
                }
                else{
                    console.log('Tidak kedaluarsa', arrJobs[x].jobName);
                }
                x++;
                }
        });
        }).catch(e => {
            console.log("error fetching data jobs", e);
        }) 

    await admin_fire.collection('Informasi').orderBy('dateCreated', 'desc')
    .get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            if(!doc.exists){
                console.log('No such document in information');
            }
            else{
                arrInformation[z] = doc.data();
                console.log('else informations');
                z++;
                
                }
            })
        })

    await admin_fire.collection('banner').orderBy('dateCreated', 'desc')
    .get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            if(!doc.exists){
                console.log('No such document in banner');
            }
            else{
                arrBanner[y] = doc.data();
                console.log('else banner');
                y++;
            }
        })
    })

    await admin_fire.collection('about').doc('data')
    .get().then(function(querySnapshot) {


            if(!querySnapshot.exists){
                console.log('No such document in about!'); 
            }
            else{
                arrAbout = querySnapshot.data();
                console.log('else about', arrAbout.latitude);
               // a++;
            } 

        }).catch(e => {
            console.log("error fetching data about", e);
        })

    /*
    await admin_fire.collection('IKA_member_registration')
    .get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc){
            if(!doc.exists){
                console.log('No such document in tracer_study!'); 
            }
            else{
                arrIKAReg[k] = doc.data();
                console.log('else tracer study', doc.data());
                k++;
            } 

        });
    })
    */

    //response.render('index', { data: { arr, arrJobs, arrInformation, arrBanner, arrIKAReg}});
    response.render('index', { data: { arr, arrJobs, arrInformation, arrBanner, arrAbout}}); 
}


     
app.get('/', async (request,response) => {
    try{       
        getCompaniesData(response);

    }
    catch(e){
        console.log('Something went wrong ', e); 
    }
});

async function insertAbout(request, response){
    const writeResult = admin.firestore();
    const addCompanies = writeResult.collection('about').doc('data');   
        await addCompanies.set({
            address : request.body.address,
            latitude: request.body.latitude,
            longitude: request.body.longitude,
            location: request.body.location,
            phonenumber_one: request.body.phonenumber_one,
            phonenumber_two: request.body.phonenumber_two,
            email: request.body.email,
            inst_username: request.body.inst_username,
            facebook_username : request.body.facebook_username,
            facebook_page_kode : request.body.facebook_page_kode,
            twitter_username : request.body.twitter_username,
            website_url : request.body.website_url,
            fax_number : request.body.fax_number
        })        
        .then(function() {        
            console.log("Company is successfully inserted");        
            getCompaniesData(response);
        })        
        .catch(function(error) {        
            console.error("Error writing companies: ", error);        
        });        
}

async function insertFormCompany(request, response){
    const writeResult = admin.firestore();
    const addCompanies = writeResult.collection('companies').doc();   
    const companyID = addCompanies.id;
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
        await addCompanies.set({
            companyID: companyID,
            companyName: request.body.companyName,
            companyAddress: request.body.companyAddress,
            companyDescription: request.body.companyDescription,
            companyEmail: request.body.companyEmail,
            companyLogo: request.body.companyLogo,
            companyWebsite: request.body.companyWebsite,
            dateCreated : dateCreated
        })        
        .then(function() {        
            console.log("Company is successfully inserted");        
            getCompaniesData(response);
        })        
        .catch(function(error) {        
            console.error("Error writing companies: ", error);        
        });        
}

async function insertPanggilanTes(request, response){
    const writeResult = admin.firestore();
  
    var parsedVar =  JSON.parse(request.body.penispanggilanTes);
    console.log("panggilan tes com", parsedVar.companyID);
    console.log("panggilan tes jobID", parsedVar.jobID);      

    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
    const addPanggilanTes = writeResult.collection('panggilanTes').doc(parsedVar.companyID).collection(parsedVar.companyID).doc(parsedVar.jobID);   
   
        await addPanggilanTes.set({
            jobName : parsedVar.jobName,
            link : request.body.link,
            date : dateCreated
        })        
        .then(function() {        
            console.log("panggilan tes is successfully inserted");        
            getCompaniesData(response);
        })        
        .catch(function(error) {        
            console.error("Error writing panggilan tes: ", error);        
        });      
        
}


async function insertFormJob(request,response){
    const writeResult = admin.firestore();
    const addJob = writeResult.collection('jobs').doc(); 
    const jobID = addJob.id;
    var arr_company = JSON.parse(request.body.companyName);
    const addCompanyJobs = writeResult.collection('companies_jobs').doc(arr_company.companyID).collection(arr_company.companyID);
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
    /*
    console.log("insertFormJob", arr_company.companyEmail);
    console.log('date is ', request.body.startDate);
    console.log('date now ', admin.firestore.Timestamp.now().toDate());
    console.log('be el be ', today.format());
    console.log('date now2', new Date());
    */

    await addJob.set({
        companyID: arr_company.companyID ,
        companyName: arr_company.companyName,
        companyEmail: arr_company.companyEmail,
              
        jobID: jobID,
        jobName: request.body.jobName,
        detail: request.body.detail,
        quickApply: (request.body.quickApply == 'true'),
        startDate: admin.firestore.Timestamp.fromDate(new Date(request.body.startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(request.body.endDate)),
        dateCreated : dateCreated
    })        
    .then(function() {        
        console.log("jobs is successfully written!");        
    })        
    .catch(function(error) {        
        console.error("Error writing jobs: ", error);        
    });  

    await addCompanyJobs.doc(jobID).set({
        companyID: arr_company.companyID ,
        companyName: arr_company.companyName,
        companyEmail: arr_company.companyEmail,
              
        jobID: jobID,
        jobName: request.body.jobName,
        detail: request.body.detail,
        quickApply: (request.body.quickApply == 'true'),
        startDate: admin.firestore.Timestamp.fromDate(new Date(request.body.startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(request.body.endDate)),
        dateCreated: dateCreated
    }).then(function() {        
        console.log("companies_jobs successfully written!");        
        getCompaniesData(response);
    })        
    .catch(function(error) {        
        console.error("Error writing companies_jobs: ", error);        
    });  
  
}

async function insertFormJobInActive(writeResult, data){
    console.log("ahoy");

    const addCompanyJobs = writeResult.collection('companies_jobs_inactive').doc(data.companyID).collection(data.companyID).doc(data.jobID);
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();

    /*
    console.log("insertFormJob", arr_company.companyEmail);
    console.log('date is ', request.body.startDate);
    console.log('date now ', admin.firestore.Timestamp.now().toDate());
    console.log('be el be ', today.format());
    console.log('date now2', new Date());
    */

    var startDateEdited = new Date(data.startDate);
    startDateEdited.setHours(new Date().getHours());

    var startEndEdited = new Date(data.endDate);
    startEndEdited.setHours(new Date().getHours());

    await addCompanyJobs.set({
        companyID: data.companyID ,
        companyName: data.companyName,
        companyEmail: data.companyEmail,
        jobID: data.jobID,
        jobName: data.jobName,
        detail: data.detail,
        quickApply: (data.quickApply == 'true'),
        startDate: admin.firestore.Timestamp.fromDate(startDateEdited),
        endDate: admin.firestore.Timestamp.fromDate(startEndEdited),
        dateCreated: dateCreated
    }).then(function() {        
        console.log("companies_jobs successfully written!");        
        //getCompaniesData(response);
    })        
    .catch(function(error) {        
        console.error("Error writing companies_jobs: ", error);        
    });  
}

async function insertInfomation(request, response){
    const writeResult = admin.firestore();
    const addInformation = writeResult.collection('Informasi').doc();
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
        await addInformation.set({
            informasiID : addInformation.id,
            informasi_name: request.body.informationName,
            detail: request.body.informationDetail,
            category: request.body.informationCategory,
            by: request.body.informationBy,
            dateCreated: dateCreated
        }).then(function(){
            console.log("information is successfully inserted");
            getCompaniesData(response);
        }).catch(function(error) {
            console.log("error inserting information ", error);
        });
}

async function insertBanner(request, response){
    const writeResult = admin.firestore();
    const addBanner = writeResult.collection('banner').doc();
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
        await addBanner.set({
            id: addBanner.id,
            Nama: request.body.Nama,
            link: request.body.link,
            dateCreated: dateCreated
        }).then(function(){
            console.log("Banner is successfully inserted");
            getCompaniesData(response);
        }).catch(function(error){
            console.log("error inserting banner ", error);
        });
}

async function insertFormIKAmember(request, response){
    var parsedVar = JSON.parse(request.body.validate);
    const writeResult = admin.firestore();
    const addCompanies = writeResult.collection('IKA_member').doc(parsedVar.nim);   
    const dateCreated = admin.firestore.FieldValue.serverTimestamp();
        await addCompanies.set({
            nama_lengkap : parsedVar.nama_lengkap,
            nim : parsedVar.nim,
            fileName : parsedVar.fileName,
            phoneNumber : parsedVar.phoneNumber,
            dateCreated : dateCreated
        })        
        .then(function() {        
            console.log("IKA member is successfully inserted");        
            getCompaniesData(response);
        })        
        .catch(function(error) {        
            console.error("Error writing IKA member: ", error);        
        });        
}

async function updateJobFunc(writeResult, request, jobID){
    const updateJobs = writeResult.collection('jobs').doc(jobID);
    await updateJobs.update({
        jobName: request.body.job_name,
        detail: request.body.job_detail,
        quickApply: (request.body.job_quickApply == 'true'),
        startDate: admin.firestore.Timestamp.fromDate(new Date(request.body.job_startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(request.body.job_endDate))
        }).then(function(){
            console.log("job is successfully updated");
        }).catch(function(error) {
            console.log("error updating job ", error);
        });
}

async function updateCompaniesJobJobFunc(writeResult, request, companyID, jobID){
    const updateCompaniesJobs = writeResult.collection('companies_jobs').doc(companyID).collection(companyID).doc(jobID);
    await updateCompaniesJobs.update({  
        jobName: request.body.job_name,
        detail: request.body.job_detail,
        quickApply: (request.body.job_quickApply == 'true'),
        startDate: admin.firestore.Timestamp.fromDate(new Date(request.body.job_startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(request.body.job_endDate))
        }).then(function(){
            console.log("Companies job is successfully updated");
        }).catch(function(error) {
            console.log("error updating companies job ", error);
        });
}

async function doUpdateJobsAll(request, response){
    var companyData = JSON.parse(request.body.editCompanyJob);
    var jobData = JSON.parse(request.body.penis);
    const writeResult = admin.firestore();
    new Promise(function(resolve){
        resolve(updateJobFunc(writeResult, request, jobData.jobID), updateCompaniesJobJobFunc(writeResult, request, companyData.companyID, jobData.jobID));
    }).then(()=>{
        getCompaniesData(response);
    });
}

async function updateCompaniesFunc(request){
    var companyData = JSON.parse(request.body.editCompany);
    const writeResult = admin.firestore(); 
    const updateCompanies = writeResult.collection('companies').doc(companyData.companyID);

    await updateCompanies.update({
        companyName: request.body.comp_name,
        companyAddress: request.body.comp_address,
        companyEmail: request.body.comp_email,
        companyLogo: request.body.comp_logo_input,
        companyWebsite: request.body.comp_website
        }).then(function(){
            console.log("companies is successfully updated");
        }).catch(function(error) {
            console.log("companies is failed to update", error);
        });
}


async function updateCompanyJobFunc(request, jobID, writeResult){
    const updateJobs = writeResult.collection('jobs').doc(jobID);
    await updateJobs.update({
        companyName: request.body.comp_name,
        companyEmail: request.body.comp_email
        }).then(function(){
            console.log("job is successfully updated");
        }).catch(function(error) {
            console.log("job is failed to update", error);
        }); 
}


async function test(request){
    var companyData = JSON.parse(request.body.editCompany);
    const writeResult = admin.firestore();
  
    var length = Object.keys(arrJobs).length;

    console.log('length', length);
    for(var i = 0; i < length; i++){
        console.log('paxx', arrJobs[i].jobName);
        if(companyData.companyID == arrJobs[i].companyID){
            console.log('masuk', arrJobs[i].jobID);
            updateCompanyJobFunc(request,  arrJobs[i].jobID, writeResult);
        }
    }
}

async function updateCompaniesCompaniesJobFunc(request, companyID, jobID, writeResult){
    const updateCompaniesJobs = writeResult.collection('companies_jobs').doc(companyID).collection(companyID).doc(jobID);
    await updateCompaniesJobs.update({
        companyName: request.body.comp_name,
        companyEmail: request.body.comp_email
        }).then(function(){
            console.log("companies job is successfully updated");
        }).catch(function(error) {
            console.log("companies job is failed to update", error);
        }); 
}

async function test2(request){
    var companyData = JSON.parse(request.body.editCompany);
    const writeResult = admin.firestore(); 
  
    var length = Object.keys(arrJobs).length;

    console.log('length2', length);
    for(var i = 0; i < length; i++){
        console.log('paxx2', arrJobs[i].jobName);
        if(companyData.companyID == arrJobs[i].companyID){
            console.log('masuk2', arrJobs[i].jobID);
            updateCompaniesCompaniesJobFunc(request,  companyData.companyID, arrJobs[i].jobID, writeResult);
        }
    }
}

async function doAllUpdateCompany(request, response){
    new Promise(function(resolve){
        resolve(updateCompaniesFunc(request), test(request),
        test2(request));
    }).then(()=>{
        getCompaniesData(response);
    });

}

async function doAllDeleteCompany(request,response){
    const writeResult = admin.firestore(); 
    var parsedVar = JSON.parse(request.body.deleteCompany).companyID;
    console.log("companyLog", parsedVar);
    new Promise(function(resolve){
        resolve(deleteCompaniesJobsFunc(writeResult, parsedVar), 
        deleteCompaniesInactiveJobsFunc(writeResult, parsedVar), 
        deleteJobsFunc(writeResult, parsedVar), 
        deleteCompanies(writeResult, parsedVar));
    }).then(()=>{
        getCompaniesData(response);
    });

}

async function deleteCompanies(writeResult, companyID){
    const deleteCompany = writeResult.collection('companies');
    console.log('companyID', companyID);
    await deleteCompany.doc(companyID).delete().then( function() {
    console.log('Document is successfully deleted');
    }).catch(function(error){
        console.error('error deleting document', error);
    });
}

async function deleteCompaniesJobsFunc(writeResult, companyID){
    var length = Object.keys(arrJobs).length;

    for(var i = 0; i < length; i++){
        if(companyID==arrJobs[i].companyID){
            deleteCompaniesJobs(writeResult, companyID, arrJobs[i].jobID);
        }
    }

}

async function deleteCompaniesJobs(writeResult, companyID, jobID){
    const deleteCompany = writeResult.collection('companies_jobs');
    await deleteCompany.doc(companyID).collection(companyID).doc(jobID).delete().then(function() {
        console.log('companies_jobs is successfully deleted');
    }).catch(function(error){
        console.error('error deleting companies_jobs', error);
    });
}

async function deleteJobsFunc(writeResult, companyID){
    var length = Object.keys(arrJobs).length;

    for(var i = 0; i < length; i++){
        if(companyID==arrJobs[i].companyID){
            deleteJobs(writeResult, arrJobs[i].jobID);
        }
    }

}

async function deleteJobs(writeResult, jobID){
    const refdeleteJobs = writeResult.collection('jobs');
    await refdeleteJobs.doc(jobID).delete().then(function(){
        console.log('jobs is successfully deleted');
    }).catch(function(error){
        console.log('error deleting job', error);
    });;
};

async function deleteCompaniesInactiveJobs(writeResult, companyID, jobID){
    const delCompanyJobsInactiveJobs = writeResult.collection('companies_jobs_inactive');

    console.log('fuck you niggas talking about');
    await  delCompanyJobsInactiveJobs.doc(companyID).collection(companyID).doc(jobID).delete().then(function() {
        console.log('companies_jobs is successfully deleted');
    }).catch(function(error){
        console.error('error deleting companies_jobs', error);
    });
}

async function deleteCompaniesInactiveJobsFunc(writeResult, companyID){
    var length = Object.keys(arrJobs).length;
    console.log('fuck you niggas talking about Func');
    for(var i = 0; i < length; i++){
        console.log('Crot di dalam');
        if(companyID==arrJobs[i].companyID){
            console.log('passy ',arrJobs[i].companyID);
            deleteCompaniesInactiveJobs(writeResult, companyID, arrJobs[i].jobID);
        }
    }

}

async function doAllDeleteJob(request, response){
    var parsedVar = JSON.parse(request.body.button_job);
    console.log('parsedVar', parsedVar.jobID);
    new Promise(function(resolve){
        resolve(deleteOneCompanyJob(parsedVar),deleteOneJob(parsedVar));
    }).then(()=>{
        getCompaniesData(response);
    })
}

async function deleteOneJob(request){
    const writeResult = admin.firestore();
    await writeResult.collection('jobs').doc(request.jobID).delete();
};

async function deleteOneCompanyJob(request){
    const writeResult = admin.firestore();
    await writeResult.collection('companies_jobs').doc(request.companyID).collection(request.companyID).doc(request.jobID).delete();
};


async function deleteOneInformation(informasiID){
    const writeResult = admin.firestore();
    await writeResult.collection('Informasi').doc(informasiID).delete();
};

async function AlldeleteOneInformation(request,response){
    var informasiID = request.body.deleteInformasi;
    new Promise(function(resolve){
        console.log('informasiID', informasiID);
        resolve(deleteOneInformation(informasiID));
    }).then(()=>{
        getCompaniesData(response);
    })
}

async function AlldeleteOneBanner(request, response){
    var id = request.body.deleteBanner;
    console.log('bannerID', id);
    new Promise(function(resolve){
        resolve(deleteOneBanner(id));
    }).then(()=>{
        getCompaniesData(response);
    })
}

async function deleteOneBanner(id){
    const writeResult = admin.firestore();
    await writeResult.collection('banner').doc(id).delete();
}

app.post('/insert_about', async(request, response) => {
    try{
        insertAbout(request, response);
    }catch(e){
        console.log('error inserting about', e);
    }
})

app.post('/insert_Company',async (request,response) =>{ 
    try{
        insertFormCompany(request, response);
    }   
    catch(e){
        console.log('error inserting company', e);
    }         
});
    
app.post('/insert_panggilanTes',async (request,response) =>{ 
    try{
        insertPanggilanTes(request, response);
    }   
    catch(e){
        console.log('error inserting panggilan tes', e);
    }         
});
    

app.post('/insert_Job',async (request,response) =>{ 
    try{
        insertFormJob(request, response);
    }   
    catch(e){
        console.log('error inserting job', e);
    }    
});

app.post('/insert_information', async(request, response) => {
    try{
        insertInfomation(request, response);
    }catch(e){
        console.log('error inserting information', e);
    }
})

app.post('/insert_banner', async(request, response) => {
    try{
        insertBanner(request, response);
    }catch(e){
        console.log('error inserting banner', e);
    }
})

app.post('/delete_company', async (request, response) =>{
    try{
        doAllDeleteCompany(request, response);
    }
    catch(e){
        console.log('error deleting company', e);
    }
});

app.post('/delete_job', async(request, response) => {
    try{
        doAllDeleteJob(request, response);
    }    
    catch(e){    
        console.log('error deleting job', e);
    }
});
 

app.post('/delete_information', async(request, response) => {
    try{
        AlldeleteOneInformation(request,response);
    }catch(e){
        console.log('error deleting information');
    }
})

app.post('/delete_banner', async(request, response)=> {
    try{
        AlldeleteOneBanner(request, response);
    }catch(e){
        console.log('error delete banner');
    }
})

app.post('/validate', async(request, response)=> {
    try{
        insertFormIKAmember(request, response)

    }

    catch(e){
        console.log('error verifying');
    }
})

app.post('/edit_company', async(request, response) =>{
    try{
        doAllUpdateCompany(request, response);
    }
    catch(e){
        console.log('error updating company');
    }
})

app.post('/edit_job', async(request, response) =>{
    try{
        doUpdateJobsAll(request, response);
    }
    catch(e){
        console.log('error updating job');
    }
})

app.post('/expired',async (request,response) =>{ 
    try{
        insertFormJob(request, response);
    }   
    catch(e){
        console.log('error inserting job', e);
    }    
});

app.post('/action_refresh', async (request, response) =>{
    try{
        getCompaniesData(response);
    }catch(e){
        console.log('error refreshing', e);
    }
})

exports.app = functions.https.onRequest(app);