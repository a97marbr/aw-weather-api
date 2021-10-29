const mysql = require('mysql');
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
    projectId: 'avancerade-webbteknologier',
    keyFilename: 'auth/avancerade-webbteknologier-65f4f04817be.json',
});

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// const name = 'projects/my-project/secrets/my-secret/versions/5';
const db_user_secret = 'projects/avancerade-webbteknologier/secrets/sql_user/versions/latest';
const db_pwd_secret = 'projects/avancerade-webbteknologier/secrets/sql_pwd/versions/latest';

// Imports the Secret Manager library
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
    try {
        const [db_user_version] = await client.accessSecretVersion({
            name: db_user_secret,
            //db_pwd: db_pwd_secret,
        });

        // Extract the db_user as a string.
        const db_user = db_user_version.payload.data.toString();

        const [db_pwd_version] = await client.accessSecretVersion({
            //name: db_user_secret,
            name: db_pwd_secret,
        });

        // Extract the db_user as a string.
        const db_pwd = db_pwd_version.payload.data.toString();

        // WARNING: Do not print the secret in a production environment - this
        // snippet is showing how to access the secret material.
        console.info(`Payload: ${db_user},${db_pwd}`);
        return {user:db_user,password:db_pwd}
    } catch (err) {
        console.error(`Something went wrong when fetching secrets, ${err}`);
    }

}

async function dbconnect()
{
    const credentials = await accessSecretVersion();
    return mysql.createConnection({
        host: 'localhost',
        user: credentials.user,
        password: credentials.password,
        database: 'weather'
    });
}

const locations = [];
const climatecodes = [];
const forecasts = [];
const comments = [];
const likes = [];

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

async function process_locations(connection) {
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

        // Remove comments to update firestore data
        // for (location of locations) {
        //     const document = firestore.doc(`locations/${location.name}`);
        //     document.set(location).then(() => {
        //         // Handle if document successfully created
        //     }).catch((err) => {
        //         console.log(`Something went wrong adding location: \n\n${err}`)
        //     });
        // }
    })

}

async function process_climatecodes(connection) {
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

        // Remove comments to update firestore data
        // for (climatecode of climatecodes) {
        //     const document = firestore.doc(`climatecodes/${climatecode.code}`);
        //     document.set(climatecode).then(() => {
        //         // Handle if document successfully created
        //     }).catch((err) => {
        //         console.log(`Something went wrong adding climatecode: \n\n${err}`)
        //     });
        // }
    })
}

async function process_forecasts(connection) {
    sql = `SELECT * FROM forecast`;
    connection.query(sql, async (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        for (row of results) {
            let forecast = {};
            for (col in row) {
                if (row[col] != "" && row[col] != "Unknown" && row[col] != "-") {
                    if (col == "auxdata") {
                        let auxdata = JSON.parse(row[col]);
                        for (prop in auxdata) {
                            if (isNumeric(auxdata[prop])) {
                                auxdata[prop.toLowerCase()] = Number(auxdata[prop]);
                            } else {
                                auxdata[prop.toLowerCase()] = auxdata[prop];
                            }
                            delete auxdata[prop];
                        }
                        forecast[col] = auxdata;
                    } else {
                        forecast[col] = row[col];
                    }
                }
            }
            forecasts.push(forecast);
        }
        console.log(forecasts);

        // Remove comments to update firestore data
        // for (forecast of forecasts) {
        //     console.log("Adding", forecast);
        //     firestore.collection('forecasts').add(forecast).then(() => {
        //         // Handle if document successfully created
        //     }).catch((err) => {
        //         console.log(`Something went wrong adding forecast: \n\n${err}`)
        //     });
        // }
    })
}

async function run()
{
    const connection = await dbconnect();

    connection.connect(function (err) {
        if (err) {
            return console.error('error: ' + err.message);
        }
    
        console.log('Connected to the MySQL server.');
    });
    
    process_locations(connection);
    process_climatecodes(connection);
    process_forecasts(connection);
    
    connection.end(function (err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });
}

run();
