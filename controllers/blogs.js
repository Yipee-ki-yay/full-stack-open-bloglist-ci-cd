const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//     return authorization.substring(7)
//   }
//   return null
// }

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const token = request.token
  // const token = getTokenFrom(request)
  // const decodedToken = jwt.verify(token, process.env.SECRET)
  const user = request.user

  if (!token || !user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  // const user = await User.findById(body.userId)

  if (!body.title || !body.author) {
    return response.status(400).json({
      error: 'title or author is missing'
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    const user = request.user

    if ( blog.user.toString() !== user.id ) {
      return response.status(403).json({ error: 'Only user that created the item may delete it' })
    }
    await blog.remove()
    response.status(204).end()
  } catch (error) {
    error => next(error)
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog.toJSON())
  } catch (error) {
    console.log(error)
  }
})

module.exports = blogsRouter