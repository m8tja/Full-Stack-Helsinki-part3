const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
//app.use(morgan("tiny"))

morgan.token("data", (request, response) => {
  if(request.method === "POST") {
    return JSON.stringify(request.body)
  }
  return ""
})

app.use(morgan(':method :url :status - :response-time ms :data'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/info", (request, response) => {
  const date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
                <p>${date}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if(person) {
    response.json(person)
  }
  else {
    response.status(404).end()
  }
})

app.post("/api/persons", (request, response) => {
  const id = Math.floor(Math.random() * 1000000)
  const person = request.body
  
  if(!person.name) {
    return response.status(400).json({
      error: "name missing"
    })
  }

  if(!person.number) {
    return response.status(400).json({
      error: "number missing"
    })
  }
  
  if(persons.find(p => p.name === person.name)) {
    return response.status(400).json({
      error: "name must be unique"
    })
  }

  person.id = id
  persons = persons.concat(person)
  response.json(person)

})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})