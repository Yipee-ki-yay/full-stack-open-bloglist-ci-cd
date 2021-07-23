const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

beforeAll(async (done) => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .end((err, response) => {
      token = response.body.token // save the token!
      done()
    })
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('verifies that the identifier is named id', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)

    const isIdDefined = response.body.every(b => b.id) ? true : undefined

    expect(isIdDefined).toBeDefined()
  })
})

describe('addition of a new note', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'AbbaR',
      author: 'Abob',
      likes: 10
    }

    await api.post('/api/blogs', newBlog)
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogs.map(n => n.title)
    expect(contents).toContain('AbbaR')
  })

  test('fails with status 401 if unauthorized', async () => {
    const newBlog = {
      title: 'AbbaRr',
      author: 'Abobr',
      likes: 10
    }

    await api.post('/api/blogs', newBlog)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('succeeds if the likes is missing', async () => {
    const newBlog = {
      title: 'AbbaRlike',
      author: 'Aboblike',
    }

    await api.post('/api/blogs', newBlog)
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    const isIdDefined = blogs.every(b => b.likes !== undefined) ? true : undefined
    expect(isIdDefined).toBeDefined()
  })

  test('fails with status code 400 if data invaild', async () => {
    const newBlog = {
      likes: 7,
    }

    await api.post('/api/blogs', newBlog)
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

// describe('deleting a note', () => {
//   test('sucseed deleting of specific note', async () => {
//     const blogsAtStart = await helper.blogsInDb()
//     const blogToDelete = blogsAtStart[0]

//     await api.delete(`/api/blogs/${blogToDelete.id}`)
//       .set('Authorization', `bearer ${token}`)
//       .expect(204)

//     const blogsAtEnd = await helper.blogsInDb()

//     expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

//     const titles = blogsAtEnd.map(b => b.title)

//     expect(titles).not.toContain(blogToDelete.title)
//   })
// })

describe('updation a note', () => {
  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = { ...blogToUpdate, likes: 10 }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${token}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd[0].likes).toBe(10)
  })
})

afterAll(() => {
  mongoose.connection.close()
})