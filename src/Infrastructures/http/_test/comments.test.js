const bcrypt = require('bcrypt');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

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

    const { result: { data: { accessToken: TokenMelati } } } = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'melati',
        password: 'password',
      },
    });

    accessToken.mawar = TokenMawar;
    accessToken.melati = TokenMelati;
  });

  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    beforeEach(async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-mawar',
        body: 'thread oleh mawar',
        owner: 'user-mawar',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    it('should response 401 when not authenticated', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-kuda/comments',
        payload: {
          content: 'sebuah komentar',
        },
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-mawar/comments',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 & keep the comment when payload is valid', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-mawar/comments',
        payload: {
          content: 'sebuah komentar',
        },
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    beforeEach(async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-mawar',
        body: 'thread oleh mawar',
        owner: 'user-mawar',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-melati',
        content: 'sebuah komentar',
        threadId: 'thread-mawar',
        userId: 'user-melati',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    it('should response 404 when comment not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/xxx',
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 when not authenticated', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 403 when credential is not valid', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati',
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200 when deleting valid comment with valid credential', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati',
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
