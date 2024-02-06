let express = require('express')
let sqlite3 = require('sqlite3')
let {open} = require('sqlite')
let path = require('path')

let db = null
let dbpath = path.join(__dirname, 'todoApplication.db')
let app = express()
app.use(express.json())

initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is run down by the hacker....')
    })
  } catch (e) {
    console.log(`The error that you got is ${e.message}`)
  }
}

initializeDbAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  let res = await db.all(getTodosQuery)
  response.send(res)
})

app.get('/todos/:todoId', async (request, response) => {
  let {todoId} = request.params
  let query = `select * from todo where id=${todoId}`
  let res = await db.get(query)
  response.send(res)
})

app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status} = request.body
  let query = `
               INSERT INTO
               todo (id,todo,priority,status)
              VALUES
      (
       ${id},
       '${todo}',
         '${priority}',
        '${status}'
      );`
  let data = await db.run(query)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  let todoId = request.params
  let {status = '', priority = '', todo = ''} = request.body
  let query = ''
  let column = ''
  if (status !== '') {
    column = 'Status'
    query = `update todo SET status='${status}';`
  } else if (priority !== '') {
    column = 'Priority'
    query = `update todo SET priority='${priority}';`
  } else {
    column = 'Todo'
    query = `update todo SET todo = '${todo}';`
  }
  let data = await db.run(query)
  response.send(`${column} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `DELETE from todo where id=${todoId};`
  let data = await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
