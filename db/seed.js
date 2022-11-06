const { client, getAllUsers, createUser, createTags, updateUser, getPostById, getUserById, createPost, updatePost, getAllPosts, getPostsByUser } = require('./index');
// ------------------Get Ready Functions--------------------------------
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
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE("postId","tagId")
            );
        `);
    } catch (error) {
        console.log(error)
    }
}
// ------------------Initial Setup Functions-----------------------------
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
      console.log([albert, sandra, glamgal])  
      console.log("Starting to create posts...");
      await createPost({
        authorId: albert.id,
        // authorId: 1,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
        });
  
      await createPost({
        authorId: sandra.id,
        // authorId: 2,
        title: "How does this work?",
        content: "Seriously, does this even do anything?",
        tags: ["#happy", "#worst-day-ever"]
      });
  
      await createPost({
        authorId: glamgal.id,
        // authorId: 3,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });

    } catch (error) {
      console.log(error);
    }
  }

// -------------------Tag Functions------------------------------------


// async function createPostTag(postId, tagId) {
//     try {
//       await client.query(`
//         INSERT INTO post_tags("postId", "tagId")
//         VALUES ($1, $2)
//         ON CONFLICT ("postId", "tagId") DO NOTHING;
//       `, [postId, tagId]);
//     } catch (error) {
//       throw error;
//     }
// }

// async function addTagsToPost(postId, tagList) {
//     try {
//       const createPostTagPromises = tagList.map(
//         tag => createPostTag(postId, tag.id)
//       );
  
//       await Promise.all(createPostTagPromises);
  
//       return await getPostById(postId);
//     } catch (error) {
//       throw error;
//     }
// }  

// async function createInitialTags() {
//     try {
//       console.log("Starting to create tags...");
  
//       const [happy, sad, inspo, catman] = await createTags([
//         '#happy', 
//         '#worst-day-ever', 
//         '#youcandoanything',
//         '#catmandoeverything'
//       ]);
  
//       const [postOne, postTwo, postThree] = await getAllPosts();
  
//       await addTagsToPost(postOne.id, [happy, inspo]);
//       await addTagsToPost(postTwo.id, [sad, inspo]);
//       await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
//       console.log("Finished creating tags!");
//     } catch (error) {
//       console.log("Error creating tags!");
//       throw error;
//     }
//   }
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

async function rebuildDB() {
    try {
        client.connect();

        // await Promise.all([dropTables(), createTables(), createInitialUsers(), createInitialPosts(), testDB()]);
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        // await createInitialTags();
        // await testDB();
        client.end();
    } catch (error) {
        console.log(error)
    }
}

rebuildDB();
