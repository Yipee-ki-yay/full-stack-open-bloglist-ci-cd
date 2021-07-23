// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const getObjectWithMaxVal = (arr, key) => {
  return arr.reduce((prev, current) => {
    return (prev[key] > current[key]) ? prev : current
  })
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => {
    return acc += curr.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  return getObjectWithMaxVal(blogs, 'likes')
}

const mostBlogs = (blogs) => {
  const mostAutorBlogs = blogs.reduce((acc, current) => {
    if ( acc[current.author] ) {
      acc[current.author]['blogs'] = acc[current.author].blogs + 1
    } else {
      const author = {
        author: current.author,
        blogs: 1,
      }

      acc[current.author] = { ...author }
    }

    return acc
  }, {})

  return getObjectWithMaxVal(Object.values(mostAutorBlogs), 'blogs')
}

const mostLikes = (blogs) => {
  const mostAutorLikes = blogs.reduce((acc, current) => {
    if ( acc[current.author] ) {
      acc[current.author]['likes'] += current.likes
    } else {
      const author = {
        author: current.author,
        likes: current.likes,
      }

      acc[current.author] = { ...author }
    }

    return acc
  }, {})

  return getObjectWithMaxVal(Object.values(mostAutorLikes), 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}