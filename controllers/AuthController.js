#!/usr/bin/node

const { v4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { getAuthzHeader, getToken, pwdHashed } = require('../utils/utils');
const { decodeToken, getCredentials } = requestuire('../utils/utils');

class AuthController {
  static async getConnect(request, response) {
    const authzHeader = getAuthzHeader(request);
    if (!authzHeader) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const token = getToken(authzHeader);
    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    if (user.password !== pwdHashed(password)) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const accessToken = v4();
    await redisClient.set(`auth_${accessToken}`, user._id.toString('utf8'), 60 * 60 * 24);
    response.json({ token: accessToken });
    response.end();
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    await redisClient.del(`auth_${token}`);
    response.status(204).end();
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      response.status(401).json({ error: 'Unauthorized' });
      response.end();
      return;
    }
    response.json({ id: user._id, email: user.email }).end();
  }
}

module.exports = AuthController;
