#!/usr/bin/node

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(request, response) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      response.json({ redis: true, db: true });
      response.end();
    }
  }

  static async getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    response.json({ users, files });
    response.end();
  }
}

export default AppController;
