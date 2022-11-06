const { client, getAllUsers, createUser, updateUser, getUserById, createPost, updatePost, getAllPosts, getPostsByUser } = require('./index');

async function testDB() {
    try {

        const users = await getAllUsers();
        console.log( users );

        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
          });
        console.log("Result: ", updateUserResult)
    } catch (error){

        console.log(error)
    }
}

async function dropTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
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
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts(
                "id" SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "content" TEXT NOT NULL,
                "active" BOOLEAN DEFAULT true
            );
            CREATE TABLE tags(
                "id" SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags(
                "postID" INTEGER UNIQUE REFERENCES posts(id),
                "tagID" INTEGER UNIQUE REFERENCES tags(id)
            )
        `);
    } catch (error) {
        console.log(error)
    }
}

async function createInitialUsers() {
    try {
  
        await createUser({username:'albert', password:'bertie99', name: 'Al Bert', location: 'Sydney, Australia' });
        await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin" });
        await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });
  
    } catch(error) {
        console.log(error)
    }
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      console.log("Starting to create posts...");
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
  
      await createPost({
        authorId: sandra.id,
        title: "How does this work?",
        content: "Seriously, does this even do anything?"
      });
  
      await createPost({
        authorId: glamgal.id,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing."
      });

    } catch (error) {
      console.log(error);
    }
  }

async function createTags(tagList) {
    if (tagList === 0){
        return;
    }

    const insertValues = tagList.map(
        (_, index) => `$${index +1}`).join('), (');
    
    const selectValues = tagList.map(
        (_, index) => `$${index +1}`).join('), (');
    
    try {
        `INSERT INTO tags(${insertValues})
        VALUES ($1), ($2), ($3)
        ON CONFLICT (${insertValues}) DO NOTHING;
        
        SELECT * FROM tags
        WHERE ${selectValues}
        IN ($1, $2, $3);`
    } catch (error) {
        console.log(error)
    }
}

async function createPostTag(postId, tagId) {
    try {
      await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
      `, [postId, tagId]);
    } catch (error) {
      throw error;
    }
  }
// async function createPostTable() {
//     try {
//         await client.query(`
//             CREATE TABLE posts(
//                 "id" SERIAL PRIMARY KEY,
//                 "authorId" INTEGER REFERENCES users(id) NOT NULL,
//                 "title" VARCHAR(255) NOT NULL,
//                 "content" TEXT NOT NULL,
//                 "active" BOOLEAN DEFAULT true
//             );
//         `)
//     } catch (error) {
//         console.log(error)
//     }
// }

async function rebuildDB() {
    try {
        client.connect();

        await Promise.all([dropTables(), createTables(), createInitialUsers(), createInitialPosts(), testDB()]);
        // await dropTables();
        // await createTables();
        // await createInitialUsers();
        // await createInitialPosts();
        // await testDB();
        client.end();
    } catch (error) {
        console.log(error)
    }
}

rebuildDB();
