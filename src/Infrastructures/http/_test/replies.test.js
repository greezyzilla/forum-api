const bcrypt = require('bcrypt');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const accessToken = {};

describe('Replies', () => {
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
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

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/comment-melati/replies',
        payload: {
          content: 'sebuah balasan',
        },
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 when not authenticated', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-mawar/comments/comment-melati/replies',
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
        url: '/threads/thread-mawar/comments/comment-melati/replies',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 & keep the reply when payload is valid', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-mawar/comments/comment-melati/replies',
        payload: {
          content: 'sebuah balasan',
        },
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
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

      await RepliesTableTestHelper.addReply({
        id: 'reply-mawar',
        content: 'sebuah komentar',
        threadId: 'thread-mawar',
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    it('should response 404 when reply not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati/replies/xxx',
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
        url: '/threads/thread-mawar/comments/comment-melati/replies/reply-mawar',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 403 when credential is not valid', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati/replies/reply-mawar',
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200 when deleting reply with valid credential', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-mawar/comments/comment-melati/replies/reply-mawar',
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
