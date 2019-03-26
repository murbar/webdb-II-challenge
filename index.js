const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './data/lambda.sqlite3'
  }
};

const db = knex(knexConfig);
const server = express();

server.use(express.json());
server.use(helmet());

server.get('/api/zoos', async (req, res) => {
  try {
    const zoos = await db('zoos');
    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json({ error: 'Cannot get zoos.' });
  }
});

server.get('/api/zoos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const zoo = await db('zoos')
      .where({ id })
      .first();
    if (!zoo) {
      res.status(404).json({ error: 'No zoo by that ID.' });
    } else {
      res.status(200).json(zoo);
    }
  } catch (error) {
    res.status(500).json({ error: 'Cannot get zoo.' });
  }
});

server.post('/api/zoos', async (req, res) => {
  try {
    const { body: newZoo } = req;
    if (!newZoo.name) {
      res.status(400).json({ error: 'A zoo must have a name.' });
    } else {
      const [newZooId] = await db('zoos').insert(newZoo);
      res.status(201).json(newZooId);
    }
  } catch (error) {
    res.status(500).json({ error: 'Cannot create zoo.' });
  }
});

server.put('/api/zoos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { body: zooUpdates } = req;
    const updatedCount = await db('zoos')
      .where({ id })
      .update(zooUpdates);
    if (!updatedCount) {
      res.status(404).json({ error: 'No zoo by that ID.' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: 'Cannot update zoo.' });
  }
});

server.delete('/api/zoos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await db('zoos')
      .where({ id })
      .del();
    if (!deletedCount) {
      res.status(404).json({ error: 'No zoo by that ID.' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: 'Cannot delete zoo.' });
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
