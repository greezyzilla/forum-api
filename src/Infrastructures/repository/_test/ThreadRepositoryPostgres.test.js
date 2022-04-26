const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
const RegisterComment = require('../../../Domains/threads/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/threads/entities/RegisteredComment');
const RegisterCommentReply = require('../../../Domains/threads/entities/RegisterCommentReply');
const RegisteredCommentReply = require('../../../Domains/threads/entities/RegisteredCommentReply');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-mawar',
      username: 'mawar',
      fullname: 'Himawari',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-melati',
      username: 'melati',
      fullname: 'Mela Syahputri',
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('Thread', () => {
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

    describe('addThread', () => {
      it('should persist register thread and return registered thread correctly', async () => {
        const registerThread = new RegisterThread({
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-mawar',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        await threadRepositoryPostgres.addThread(registerThread);

        const { threads } = await ThreadsTableTestHelper.findThreadById('thread-123');
        expect(threads).toHaveLength(1);
      });

      it('should return registered thread correctly', async () => {
        const registerThread = new RegisterThread({
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-mawar',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const registeredThread = await threadRepositoryPostgres.addThread(registerThread);

        expect(registeredThread).toStrictEqual(new RegisteredThread({
          id: 'thread-123',
          title: 'sebuah thread',
          owner: 'user-mawar',
        }));
      });
    });

    describe('getThreadById', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.getThreadById({ threadId: 'thread-melati' })).rejects.toThrowError(NotFoundError);
      });

      it('should return thread data correctly', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        const thread = await threadRepositoryPostgres.getThreadById({ threadId: 'thread-mawar' });

        expect(thread).toHaveProperty('id');
        expect(thread).toHaveProperty('title');
        expect(thread).toHaveProperty('body');
        expect(thread).toHaveProperty('date');
        expect(thread).toHaveProperty('username');
        expect(thread).toHaveProperty('comments');
        expect(thread.id).toStrictEqual('thread-mawar');
        expect(thread.body).toStrictEqual('thread oleh mawar');
        expect(thread.username).toStrictEqual('mawar');
        expect(thread.comments).toHaveLength(0);
      });
    });

    describe('verifyThreadById', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyThreadById({ threadId: 'thread-melati' })).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyThreadById({ threadId: 'thread-mawar' })).resolves.not.toThrowError(NotFoundError);
      });
    });
  });

  describe('Comment', () => {
    beforeEach(async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-mawar',
        body: 'thread oleh mawar',
        owner: 'user-mawar',
      });

      await ThreadsTableTestHelper.addComment({
        id: 'comment-melati',
        content: 'ini komen melati',
        threadId: 'thread-mawar',
        userId: 'user-melati',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    describe('addComment', () => {
      it('should persist register comment and return registered comment correctly', async () => {
        const registerComment = new RegisterComment({
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        await threadRepositoryPostgres.addComment(registerComment);
        const { comments } = await ThreadsTableTestHelper.findCommentById('comment-123');

        expect(comments).toHaveLength(1);
      });

      it('should return registered comment correctly', async () => {
        const registerComment = new RegisterComment({
          content: 'sebuah komentar',
          threadId: 'thread-mawar',
          userId: 'user-melati',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const registeredComment = await threadRepositoryPostgres.addComment(registerComment);

        expect(registeredComment).toStrictEqual(new RegisteredComment({
          id: 'comment-123',
          content: 'sebuah komentar',
          owner: 'user-melati',
        }));
      });
    });

    describe('verifyCommentById', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentById({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentById({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when comment found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentById({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
        })).resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('verifyCommentOwner', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentOwner({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
          userId: 'user-melati',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          userId: 'user-melati',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when the owner is not valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-mawar',
        })).rejects.toThrowError(AuthorizationError);
      });

      it('should not throw AuthorizationError when the owner is valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-melati',
        })).resolves.not.toThrowError(AuthorizationError);
      });
    });

    describe('deleteComment', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteComment({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
          userId: 'user-melati',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteComment({
          threadId: 'thread-mawar',
          commentId: 'comment-mawar',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when the owner is not valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteComment({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-mawar',
        })).rejects.toThrowError(AuthorizationError);
      });

      it('Should delete comment when payload is valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await threadRepositoryPostgres.deleteComment({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-melati',
        });
        const { comments } = await ThreadsTableTestHelper.findCommentById('comment-melati');

        expect(comments).toHaveLength(1);
        expect(comments[0].is_delete).toStrictEqual(true);
      });
    });
  });

  describe('Reply', () => {
    beforeEach(async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-mawar',
        body: 'thread oleh mawar',
        owner: 'user-mawar',
      });

      await ThreadsTableTestHelper.addComment({
        id: 'comment-melati',
        content: 'ini komen melati',
        threadId: 'thread-mawar',
        userId: 'user-melati',
      });

      await ThreadsTableTestHelper.addReply({
        id: 'reply-mawar',
        content: 'sebuah balasan dari mawar',
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    describe('addCommentReply', () => {
      it('should persist register reply and return registered reply correctly', async () => {
        const registerCommentReply = new RegisterCommentReply({
          content: 'sebuah balasan',
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-melati',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        await threadRepositoryPostgres.addCommentReply(registerCommentReply);
        const { replies } = await ThreadsTableTestHelper.findReplyById('reply-123');

        expect(replies).toHaveLength(1);
      });

      it('should return registered reply correctly', async () => {
        const registerCommentReply = new RegisterCommentReply({
          content: 'sebuah balasan',
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          userId: 'user-melati',
        });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const registeredCommentReply = await threadRepositoryPostgres
          .addCommentReply(registerCommentReply);

        expect(registeredCommentReply).toStrictEqual(new RegisteredCommentReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-melati',
        }));
      });
    });

    describe('verifyCommentReplyById', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyById({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyById({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when reply not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyById({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when reply found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyById({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
        })).resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('verifyCommentReplyOwner', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyOwner({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when reply not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-netizen',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when the owner is not valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-melati',
        })).rejects.toThrowError(AuthorizationError);
      });

      it('should not throw AuthorizationError when the owner is valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyCommentReplyOwner({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        })).resolves.not.toThrowError(AuthorizationError);
      });
    });

    describe('deleteCommentReply', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteCommentReply({
          threadId: 'thread-melati',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteCommentReply({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when reply not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteCommentReply({
          threadId: 'thread-mawar',
          commentId: 'comment-netizen',
          replyId: 'reply-netizen',
          userId: 'user-mawar',
        })).rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when the owner is not valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.deleteCommentReply({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-melati',
        })).rejects.toThrowError(AuthorizationError);
      });

      it('Should delete reply when payload is valid', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await threadRepositoryPostgres.deleteCommentReply({
          threadId: 'thread-mawar',
          commentId: 'comment-melati',
          replyId: 'reply-mawar',
          userId: 'user-mawar',
        });
        const { replies } = await ThreadsTableTestHelper.findReplyById('reply-mawar');

        expect(replies).toHaveLength(1);
        expect(replies[0].is_delete).toStrictEqual(true);
      });
    });
  });
});
