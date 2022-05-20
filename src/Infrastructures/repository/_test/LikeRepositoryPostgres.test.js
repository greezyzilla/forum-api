const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
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

    await CommentsTableTestHelper.addComment({
      id: 'comment-mawar',
      content: 'ini komen mawal',
      threadId: 'thread-mawar',
      userId: 'user-mawar',
    });

    await LikesTableTestHelper.addLike({
      id: 'like-mawar',
      commentId: 'comment-melati',
      userId: 'user-mawar',
    });

    await LikesTableTestHelper.addLike({
      id: 'like-melati',
      commentId: 'comment-melati',
      userId: 'user-melati',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('addLike', () => {
    it('should add like correctly', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.addLike({
        commentId: 'comment-mawar',
        userId: 'user-melati',
      });

      const likes = await LikesTableTestHelper.findLikesByUserId({
        commentId: 'comment-mawar',
        userId: 'user-melati',
      });
      expect(likes).toHaveLength(1);
    });
  });

  describe('removeLike', () => {
    it('should remove like correctly', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.removeLike({
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });

      const likes = await LikesTableTestHelper.findLikesByUserId({
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });

      expect(likes).toHaveLength(0);
    });
  });

  describe('verifyLikeByCommentId', () => {
    it('should return false if not liking', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const isLiked = await likeRepositoryPostgres.verifyLikeByCommentId({
        commentId: 'comment-mawar',
        userId: 'user-mawar',
      });

      expect(isLiked).toStrictEqual(false);
    });

    it('should return true if liking', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const isLiked = await likeRepositoryPostgres.verifyLikeByCommentId({
        commentId: 'comment-melati',
        userId: 'user-mawar',
      });

      expect(isLiked).toStrictEqual(true);
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('should return correct comment like count', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId({
        commentId: 'comment-melati',
      });

      expect(likeCount).toStrictEqual(2);
    });

    it('should return zero if no one liking', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId({
        commentId: 'comment-mawar',
      });

      expect(likeCount).toStrictEqual(0);
    });
  });
});
