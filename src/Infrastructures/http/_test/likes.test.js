const bcrypt = require('bcrypt');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

const accessToken = {};

describe('Likes', () => {
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
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

      await CommentsTableTestHelper.addComment({
        id: 'comment-mawar',
        content: 'sebuah komentar dari mawar',
        threadId: 'thread-mawar',
        userId: 'user-mawar',
      });

      await LikesTableTestHelper.addLike({
        id: 'like-mawar',
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT`',
        url: '/threads/xxx/comments/comment-melati/likes',
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.error).toEqual('Not Found');
    });

    it('should response 401 when not authenticated', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-mawar/comments/comment-melati/likes',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 200 when liking successfully', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-mawar/comments/comment-melati/likes',
        headers: {
          Authorization: `Bearer ${accessToken.melati}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when liking successfully', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-mawar/comments/comment-mawar/likes',
        headers: {
          Authorization: `Bearer ${accessToken.mawar}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when unliking successfully', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-mawar/comments/comment-melati/likes',
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
