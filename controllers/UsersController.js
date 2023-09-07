#!/usr/bin/node

const dbClient = require('../utils/db');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      response.end();
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      response.end();
      return;
    }
    const userExist = await dbClient.userExist(email);
    if (userExist) {
      response.status(400).json({ error: 'Already exist' });
      response.end();
      return;
    }
    const user = await dbClient.createUser(email, password);
    const id = `${user.insertedId}`;
    response.status(201).json({ id, email });
    response.end();
  }
}

module.exports = UsersController;
