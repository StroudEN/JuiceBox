const { client, getAllUsers, createUser } = require('./index');

async function testDB() {
    try {
        const users = await getAllUsers();

        console.log( users );
    } catch (error){

        console.log(error)
    }
}

async function dropTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS users;
        `);
    } catch (error) {
        console.log(error)
    }
}

async function createTables() {
    try {

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
    } catch (error) {
        console.log(error)
    }
}

async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({username:'albert', password:'bertie99' });
  
      console.log(albert);
  
      console.log("Finished creating users!");
    } catch(error) {
        console.log(error)
    }
}

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await testDB();
        client.end();
    } catch (error) {
        console.log(error)
    }
}

rebuildDB();
