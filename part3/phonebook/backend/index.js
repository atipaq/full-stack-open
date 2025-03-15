// 3.21 Deploying the database backend to production

require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const app = express();
app.use(express.static('dist'))
app.use(express.json())

app.get('/' , (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    const date = new Date()
    Person.countDocuments({}).then(result => {
        response.send(`
            <p>Phonebook has info for ${result} people</p>
            <p>${date}</p>
        `)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body


    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id, 
        { name, number },
        { new: true, runValidators: true, context: 'query'}
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})