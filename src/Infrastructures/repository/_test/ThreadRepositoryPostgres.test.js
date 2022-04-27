const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
const ReturnedThread = require('../../../Domains/threads/entities/ReturnedThread');

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

  beforeEach(async () => {
    await ThreadsTableTestHelper.addThread({
      id: 'thread-mawar',
      title: 'sebuah thread',
      body: 'thread oleh mawar',
      owner: 'user-mawar',
      date: 'date-thread-mawar',
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

      expect(thread).toStrictEqual(new ReturnedThread({
        id: 'thread-mawar',
        title: 'sebuah thread',
        body: 'thread oleh mawar',
        date: 'date-thread-mawar',
        username: 'mawar',
        comments: [],
      }));
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
