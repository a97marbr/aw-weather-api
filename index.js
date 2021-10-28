require('dotenv').config();
const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'avancerade-webbteknologier',
    //keyFilename: 'auth/avancerade-webbteknologier-65f4f04817be.json',
    keyFilename: '/auth/firestore-api-key',
});
{ 1 }

async function fetchAllLocations() {
    try {
        const locationsRef = db.collection('locations');
        //const snapshot = await locationsRef.get();
        //const snapshot = await locationsRef.where('country', '==', 'Sweden').orderBy('charter').limit(3).get();
        const snapshot = await locationsRef.orderBy('charter').limit(3).get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const result=[];
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            result.push(doc.data());
        });

        return result;
    } catch (error) {
        console.log('Something went wrong when fetching locations!', error);
    }
}

async function fetchLocation(location) {
    try {
        const locationsRef = db.collection('locations');
        //const snapshot = await locationsRef.get();
        const snapshot = await locationsRef.where('name', '==', location).limit(1).get();
        //const snapshot = await locationsRef.orderBy('charter').limit(3).get();
        if (snapshot.empty) {
            console.log(`No matching location for '${location}'`);
            return {};
        }

        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });

        return snapshot.docs[0].data();
    } catch (error) {
        console.log(`Something went wrong when fetching location '${location}'!`, error);
    }
}

async function fetchAllClimatecodes() {
    try {
        const climatecodesRef = db.collection('climatecodes');
        //const snapshot = await locationsRef.get();
        //const snapshot = await locationsRef.where('country', '==', 'Sweden').orderBy('charter').limit(3).get();
        const snapshot = await climatecodesRef.get();
        if (snapshot.empty) {
            console.log('No climatecodes found.');
            return [];
        }

        const result=[];
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            result.push(doc.data());
        });

        return result;
    } catch (error) {
        console.log('Something went wrong when fetching climatecodes!', error);
    }
}

async function fetchClimatecode(climatecode) {
    try {
        const climatecodesRef = db.collection('climatecodes');
        //const snapshot = await locationsRef.get();
        const snapshot = await climatecodesRef.where('code', '==', climatecode).limit(1).get();
        //const snapshot = await locationsRef.orderBy('charter').limit(3).get();
        if (snapshot.empty) {
            console.log(`No matching climatecode for '${climatecode}'`);
            return {};
        }

        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });

        return snapshot.docs[0].data();
    } catch (error) {
        console.log(`Something went wrong when fetching climatecode '${climatecode}'!`, error);
    }
}

// Routes

// app.get('/', function (req, res) {
//     res.send('Weather API<br><br>/api/locations<br>/api/location/:location<br>/api/climatecodes<br>/api/climatecode/:climatecode');
// })

// app.get('/api/locations', async function (req, res) {
//     const locations = await fetchAllLocations();
//     res.json(locations);
// })

// app.get('/api/location/:location', async function (req, res) {
//     const location = req.params.location;
//     const locationData = await fetchLocation(location);
//     res.json(locationData);
// })

// app.get('/api/climatecodes', async function (req, res) {
//     const climatecodes = await fetchAllClimatecodes();
//     res.json(climatecodes);
// })

// app.get('/api/climatecode/:climatecode', async function (req, res) {
//     const climatecode = req.params.climatecode;
//     const climatecodeData = await fetchClimatecode(climatecode);
//     res.json(climatecodeData);
// })

// var server = app.listen(port, () => {
//     var host = server.address().address
//     var port = server.address().port

//     console.log("Example app listening at http://%s:%s", host, port)
// })