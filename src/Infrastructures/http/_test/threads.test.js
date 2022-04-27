const bcrypt = require('bcrypt');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const accessToken = {};

describe('Threads', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-mawar',
      username: 'mawar',
      fullname: 'Himawari',
      password: await bcrypt.hash('password', 10),
    });

    await UsersTableTestHelper.addUser({
      id: 'user-melati',
      username: 'melati',
      fullname: 'Mela Syahputri',
      password: await bcrypt.hash('password', 10),
    });

    const server = await createServer(container);
    const { result: { data: { accessToken: TokenMawar } } } = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'mawar',
        password: 'password',
      },
    });

    accessToken.mawar = TokenMawar;
  });

  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 when not authenticated', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 & keep the thread when payload is valid', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxx',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response valid data for thread', async () => {
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({
        id: 'thread-mawar',
        body: 'thread oleh mawar',
        owner: 'user-mawar',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-melati',
        content: 'sebuah komentar dari melati untuk thread mawar',
        threadId: 'thread-mawar',
        userId: 'user-melati',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-mawar',
        content: 'sebuah balasan dari mawar untuk komentar melati',
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-mawar',
      });

      await ThreadsTableTestHelper.cleanTable();
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
    });
  });
});
