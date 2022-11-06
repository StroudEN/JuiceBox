const pg = require('pg')
const client = new pg.Client('postgres://localhost:5432/juicebox-dev')


// ------------------------Get Functions--------------------------------------------------
async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
        `);

        return rows;
}

async function getAllPosts() {
    const { rows } = await client.query(
        `SELECT id, "authorId", title, content, active
        FROM posts;
        `);

        return rows
}

async function getPostsByUser(userId) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM posts
            WHERE "authorId"=${userId};
        `);
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function getPostById(postId) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }

async function getUserById(userId) {
    try {
      const { rows: [ user ] } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${ userId }
      `);
  
      if (!user) {
        return null
      }
  
      user.posts = await getPostsByUser(userId);
  
      return user;
    } catch (error) {
      throw error;
    }
  }
// -----------------------Create Functions-----------------------------------------------
async function createUser({ username, password, name, location }) {
    try {
        const { result } = await client.query(`
            INSERT INTO users(username, password, name, location) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password, name, location]);

        return result 
    } catch (error) {
        console.log(error)
    }
}

async function createPost({authorId, title, content}) {
    try {
        const { postresult } =  await client.query(`
            INSERT INTO posts("authorId", title, content)
            VALUES ($1, $2, $3)
            RETURNING*;
        `, [authorId, title, content]);
        
        return postresult
    } catch (error) {
        console.log(error)
    }
}

// ----------------------Update Functions------------------------------------------------
async function updatePost(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }" = $${ index +1 }`
    ).join(', ');

    if (setString.length === 0) {
        return;
    } else {
        try {
            const {rows: [post]} = await client.query(`
            UPDATE posts
            SET ${ setString }
            WHERE id = ${ id }
            RETURNING*;
            `, Object.values(fields));

            return post
        } catch (error) {
            console.log(error)
        }
    }
}

async function updateUser(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }" = $${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    } else {

    try {
        const { rows: [ user ]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id= ${ id }
        RETURNING *;
        `, Object.values(fields));

        return user
    } catch (error) {
        console.log(error)
    }}
}

// asers
//         SET ${ seync function updateUser(id, fields = {}) {
//     const setString = Object.keys(fields).map(
//         (key, index) => `"${ key }" = $${ index + 1}`
//     ).join(', ');

//     if (setString.length === 0) {
//         return;
//     } else {

//     try {
//         const result = await client.query(`
//         UPDATE ustString }
//         WHERE id= ${ id }
//         RETURNING *;
//         `, Object.values(fields));

//         return result
//     } catch (error) {
//         console.log(error)
//     }}
// }

module.exports = { client, getAllUsers, createUser, updateUser, getUserById, createPost, updatePost, getAllPosts, getPostsByUser, getPostById }