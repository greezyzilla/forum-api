const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const RegisterReply = require('../../../Domains/replies/entities/RegisterReply');
const RegisteredReply = require('../../../Domains/replies/entities/RegisteredReply');
const ReturnedReply = require('../../../Domains/replies/entities/ReturnedReply');

describe('ReplyRepositoryPostgres', () => {
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
      content: 'ini komen melati',
      threadId: 'thread-mawar',
      userId: 'user-melati',
    });

    await RepliesTableTestHelper.addReply({
      id: 'reply-mawar',
      content: 'sebuah balasan dari mawar',
      commentId: 'comment-melati',
      userId: 'user-mawar',
      date: 'date-reply-mawar',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('addReply', () => {
    it('should persist register reply and return registered reply correctly', async () => {
      const registerReply = new RegisterReply({
        content: 'sebuah balasan',
        threadId: 'thread-mawar',
        commentId: 'comment-melati',
        userId: 'user-melati',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(registerReply);
      const { replies } = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(replies).toHaveLength(1);
    });

    it('should return registered reply correctly', async () => {
      const registerReply = new RegisterReply({
        content: 'sebuah balasan',
        threadId: 'thread-mawar',
        commentId: 'comment-melati',
        userId: 'user-melati',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const registeredReply = await replyRepositoryPostgres
        .addReply(registerReply);

      expect(registeredReply).toStrictEqual(new RegisteredReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-melati',
      }));
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return empty array when no replies found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres
        .getRepliesByCommentId({ commentId: 'comment-xxx' });

      expect(replies).toStrictEqual([]);
    });

    it('should return data correctly when a reply is not deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres
        .getRepliesByCommentId({ commentId: 'comment-melati' });

      expect(replies).toStrictEqual([new ReturnedReply({
        id: 'reply-mawar',
        content: 'sebuah balasan dari mawar',
        username: 'mawar',
        date: 'date-reply-mawar',
      })]);
    });

    it('should return data correctly when a reply is deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.deleteReply('reply-mawar');
      const replies = await replyRepositoryPostgres
        .getRepliesByCommentId({ commentId: 'comment-melati' });

      expect(replies).toStrictEqual([new ReturnedReply({
        id: 'reply-mawar',
        content: 'sebuah balasan dari mawar',
        username: 'mawar',
        date: 'date-reply-mawar',
        isDelete: true,
      })]);
    });
  });

  describe('verifyReplyById', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyById({ replyId: 'xxx' }))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyById({ replyId: 'reply-mawar' }))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner({
        replyId: 'xxx',
        userId: 'user-mawar',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when the owner is not valid', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner({
        replyId: 'reply-mawar',
        userId: 'user-melati',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when the owner is valid', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner({
        replyId: 'reply-mawar',
        userId: 'user-mawar',
      })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply', () => {
    it('Should delete reply when payload is valid', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReply({
        replyId: 'reply-mawar',
        userId: 'user-mawar',
      });
      const { replies } = await RepliesTableTestHelper.findReplyById('reply-mawar');

      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toStrictEqual(true);
    });
  });
});
