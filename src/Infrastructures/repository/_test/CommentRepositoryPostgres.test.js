const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const ReturnedComment = require('../../../Domains/comments/entities/ReturnedComment');

describe('CommentRepository.test', () => {
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

  beforeEach(async () => {
    await ThreadsTableTestHelper.addThread({
      id: 'thread-mawar',
      body: 'thread oleh mawar',
      owner: 'user-mawar',
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-melati',
      content: 'ini komentar melati',
      threadId: 'thread-mawar',
      userId: 'user-melati',
      date: 'date-comment-melati',
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
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(registerComment);
      const { comments } = await CommentsTableTestHelper.findCommentById('comment-123');

      expect(comments).toHaveLength(1);
    });

    it('should return registered comment correctly', async () => {
      const registerComment = new RegisterComment({
        content: 'sebuah komentar',
        threadId: 'thread-mawar',
        userId: 'user-melati',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const registeredComment = await commentRepositoryPostgres.addComment(registerComment);

      expect(registeredComment).toStrictEqual(new RegisteredComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-melati',
      }));
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return empty array when no comments found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comment = await commentRepositoryPostgres
        .getCommentsByThreadId({ threadId: 'thread-xxx' });

      expect(comment).toStrictEqual([]);
    });

    it('should return data correctly when a comment is not deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comment = await commentRepositoryPostgres
        .getCommentsByThreadId({ threadId: 'thread-mawar' });

      expect(comment).toStrictEqual([new ReturnedComment({
        id: 'comment-melati',
        content: 'ini komentar melati',
        username: 'melati',
        date: 'date-comment-melati',
      })]);
    });

    it('should return data correctly when a comment is deleted', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.deleteComment('comment-melati');
      const comment = await commentRepositoryPostgres
        .getCommentsByThreadId({ threadId: 'thread-mawar' });

      expect(comment).toStrictEqual([new ReturnedComment({
        id: 'comment-melati',
        content: 'ini komentar melati',
        username: 'melati',
        date: 'date-comment-melati',
        isDelete: true,
      })]);
    });
  });

  describe('verifyCommentById', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentById({
        commentId: 'xxx',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentById({
        commentId: 'comment-melati',
      })).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner({
        commentId: 'xxx',
        userId: 'user-melati',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when the owner is not valid', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner({
        commentId: 'comment-melati',
        userId: 'user-mawar',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when the owner is valid', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner({
        commentId: 'comment-melati',
        userId: 'user-melati',
      })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('Should delete comment when payload is valid', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment({
        commentId: 'comment-melati',
        userId: 'user-melati',
      });
      const { comments } = await CommentsTableTestHelper.findCommentById('comment-melati');

      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toStrictEqual(true);
    });
  });
});
