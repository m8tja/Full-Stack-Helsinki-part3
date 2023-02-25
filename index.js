require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
app.use(cors())
app.use(express.json())
app.use(express.static("build"))
//app.use(morgan("tiny"))

const Person = require("./models/person")

const unknownEndpoint = (_request, response) => {
  response.stats(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if(error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }
  else if(error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

morgan.token("data", (request) => {
  if(request.method === "POST") {
    return JSON.stringify(request.body)
  }
  return ""
})

app.use(morgan(":method :url :status - :response-time ms :data"))

app.get("/api/persons", (_request, response) => {
  Person.find({})
    .then(people => {
      response.json(people)
    })
})

app.get("/info", (_request, response) => {
  const date = new Date()

  Person.countDocuments({})
    .then(count => {
      response.send(`<p>Phonebook has info for ${count} people</p>
                <p>${date}</p>`)
    })
    .catch(error => {
      console.log(error)
    })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const person = request.body

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})