const mysql = require('mysql');
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
    projectId: 'avancerade-webbteknologier',
    keyFilename: 'auth/avancerade-webbteknologier-65f4f04817be.json',
});
{ 1 }

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sqllab',
    password: 'Tomten2009',
    database: 'weather'
});

const locations = [];
const climatecodes = [];
const forecasts = [];
const comments = [];
const likes = [];

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

async function process_locations() {
    let sql = `SELECT * FROM info`;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        for (row of results) {
            let location = {};
            for (col in row) {
                if (row[col] != "" && row[col] != "Unknown" && row[col] != "-") {
                    if (col == "charter") {
                        location[col] = parseInt(row[col]);
                    } else {
                        location[col] = row[col];
                    }
                }
            }
            locations.push(location);
        }
        console.log(locations);

        for (location of locations) {
            const document = firestore.doc(`locations/${location.name}`);
            document.set(location).then(() => {
                // Handle if document successfully created
            }).catch((err) => {
                console.log(`Something went wrong adding location: \n\n${err}`)
            });
        }
    })

}

async function process_climatecodes() {
    sql = `SELECT * FROM climatecodes`;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        for (row of results) {
            let climatecode = {};
            for (col in row) {
                if (row[col] != "" && row[col] != "Unknown" && row[col] != "-") {
                    climatecode[col] = row[col];
                }
            }
            climatecodes.push(climatecode);
        }
        console.log(climatecodes);

        for (climatecode of climatecodes) {
            const document = firestore.doc(`climatecodes/${climatecode.code}`);
            document.set(climatecode).then(() => {
                // Handle if document successfully created
            }).catch((err) => {
                console.log(`Something went wrong adding climatecode: \n\n${err}`)
            });
        }
    })
}

async function process_forecasts(){
    sql = `SELECT * FROM forecast`;
    connection.query(sql, async (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        for (row of results) {
            let forecast = {};
            for (col in row) {
                if (row[col] != "" && row[col] != "Unknown" && row[col] != "-") {
                    if(col == "auxdata"){
                        let auxdata=JSON.parse(row[col]);                        
                        for (prop in auxdata){
                            if(isNumeric(auxdata[prop])){
                                auxdata[prop.toLowerCase()] = Number(auxdata[prop]);
                            }else{
                                auxdata[prop.toLowerCase()] = auxdata[prop];
                            }
                            delete auxdata[prop];
                        } 
                        forecast[col]=auxdata;                       
                    }else{
                        forecast[col] = row[col];
                    }                    
                }
            }
            forecasts.push(forecast);
        }
        console.log(forecasts);

        for (forecast of forecasts) {
            console.log("Adding", forecast);
            firestore.collection('forecasts').add(forecast).then(() => {
                // Handle if document successfully created
            }).catch((err) => {
                console.log(`Something went wrong adding forecast: \n\n${err}`)
            });
        }
    })    
}

connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    console.log('Connected to the MySQL server.');
});

process_locations();
process_climatecodes();
process_forecasts();

connection.end(function (err) {
    if (err) {
        return console.log('error:' + err.message);
    }
    console.log('Close the database connection.');
});