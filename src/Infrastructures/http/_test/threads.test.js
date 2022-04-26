const bcrypt = require('bcrypt');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

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

  describe('/threads endpoint', () => {
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

        await ThreadsTableTestHelper.addComment({
          id: 'comment-melati',
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });
      });

      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
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

      it('should response 403 when deleting others comment', async () => {
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

      it('should response 200 when deleting valid comment with valid auth', async () => {
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

    describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
      beforeEach(async () => {
        await ThreadsTableTestHelper.addThread({
          id: 'thread-mawar',
          body: 'thread oleh mawar',
          owner: 'user-mawar',
        });

        await ThreadsTableTestHelper.addComment({
          id: 'comment-melati',
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });
      });

      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
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

        await ThreadsTableTestHelper.addComment({
          id: 'comment-melati',
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });

        await ThreadsTableTestHelper.addReply({
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

      it('should response 403 when deleting others reply', async () => {
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

      it('should response 200 when deleting valid raply with valid auth', async () => {
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

    describe('when GET /threads/{threadId}', () => {
      beforeEach(async () => {
        await ThreadsTableTestHelper.addThread({
          id: 'thread-mawar',
          body: 'thread oleh mawar',
          owner: 'user-mawar',
        });

        await ThreadsTableTestHelper.addComment({
          id: 'comment-melati',
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });

        await ThreadsTableTestHelper.addComment({
          id: 'comment-mawar',
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-mawar',
        });

        await ThreadsTableTestHelper.addReply({
          id: 'reply-melati',
          content: 'sebuah balasan dari melati',
          threadId: 'thread-mawar',
          commentId: 'comment-mawar',
          userId: 'user-melati',
        });

        await ThreadsTableTestHelper.addReply({
          id: 'reply-melati2',
          content: 'sebuah balasan dari melati (2)',
          threadId: 'thread-mawar',
          commentId: 'comment-mawar',
          userId: 'user-melati',
        });
        await pool.query({
          text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
          values: [true, 'comment-melati'],
        });

        await pool.query({
          text: 'UPDATE comment_replies SET is_delete = $1 WHERE id = $2',
          values: [true, 'reply-melati2'],
        });
      });

      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
      });

      it('should response valid data for thread', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'GET',
          url: '/threads/thread-mawar',
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(responseJson.data.thread.comments).toBeDefined();
        expect(responseJson.data.thread.comments).toHaveLength(2);
        expect(responseJson.data.thread.comments[0].username).toStrictEqual('melati');
        expect(responseJson.data.thread.comments[0].content).toStrictEqual('**komentar telah dihapus**');
        expect(responseJson.data.thread.comments[1].username).toStrictEqual('mawar');
        expect(responseJson.data.thread.comments[1].content).toStrictEqual('sebuah komentar');
        expect(responseJson.data.thread.comments[1].replies).toBeDefined();
        expect(responseJson.data.thread.comments[1].replies).toHaveLength(2);
        expect(responseJson.data.thread.comments[1].replies[0].username).toStrictEqual('melati');
        expect(responseJson.data.thread.comments[1].replies[0].content).toStrictEqual('sebuah balasan dari melati');
        expect(responseJson.data.thread.comments[1].replies[1].username).toStrictEqual('melati');
        expect(responseJson.data.thread.comments[1].replies[1].content).toStrictEqual('**balasan telah dihapus**');
      });
    });
  });
});
