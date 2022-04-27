const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const ReturnedThread = require('../../../Domains/threads/entities/ReturnedThread');
const ReturnedComment = require('../../../Domains/comments/entities/ReturnedComment');
const ReturnedReply = require('../../../Domains/replies/entities/ReturnedReply');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedReturnedThread = new ReturnedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: 'placeholder',
      username: 'dicoding',
      comments: [
        new ReturnedComment({
          id: 'comment-QgQEQ_pXXa3l3M7j5D_LU',
          content: 'sebuah komentar',
          username: 'dicoding',
          date: '2022-04-16T07:46:58.542Z',
          replies: [
            new ReturnedReply({
              id: 'reply-oXX1V5f_R_pk8Z9w8D0Hv',
              content: 'sebuah balasan',
              username: 'johndoe',
              date: '2022-04-16T07:47:17.514Z',
              isDelete: true,
            }),
            new ReturnedReply({
              id: 'reply-nYB-PmZ8IiNYyLHRotOS-',
              content: 'sebuah balasan',
              username: 'dicoding',
              date: '2022-04-16T07:47:20.004Z',
            }),
          ],
        }),
        new ReturnedComment({
          id: 'comment-V4fnXZLcQbZa_4noRBPhp',
          content: 'sebuah komentar',
          username: 'mawar',
          date: '2022-04-16T07:49:58.503Z',
          replies: [],
          isDelete: true,
        }),
      ],
    });

    const dummyComments = [
      {
        id: 'comment-QgQEQ_pXXa3l3M7j5D_LU',
        content: 'sebuah komentar',
        username: 'dicoding',
        date: '2022-04-16T07:46:58.542Z',
        replies: [
          { replyId: 'reply-oXX1V5f_R_pk8Z9w8D0Hv' },
          { replyId: 'reply-nYB-PmZ8IiNYyLHRotOS-' },
        ],
      },
      {
        id: 'comment-V4fnXZLcQbZa_4noRBPhp',
        content: 'sebuah komentar',
        username: 'mawar',
        date: '2022-04-16T07:49:58.503Z',
        replies: [],
        isDelete: true,
      },
      {
        id: 'comment-NjalBUAkUKoaz3o2Phehv',
        content: 'balasan ini tidak diambil',
        username: 'dicoding',
        date: '2022-04-16T07:46:58.542Z',
        replies: [],
        isDelete: true,
      },
    ];

    const dummyReplies = [
      {
        id: 'reply-oXX1V5f_R_pk8Z9w8D0Hv',
        content: 'sebuah balasan',
        username: 'johndoe',
        date: '2022-04-16T07:47:17.514Z',
        isDelete: true,
      },
      {
        id: 'reply-nYB-PmZ8IiNYyLHRotOS-',
        content: 'sebuah balasan',
        username: 'dicoding',
        date: '2022-04-16T07:47:20.004Z',
      },
      {
        id: 'reply-FFpqF0eLeFQ9RzSnEZhsU',
        content: 'balasan ini tidak diambil',
        username: 'dicoding',
        date: '2022-04-16T07:47:20.004Z',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(new ReturnedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: 'placeholder',
      username: 'dicoding',
      comments: [
        { commentId: 'comment-QgQEQ_pXXa3l3M7j5D_LU' },
        { commentId: 'comment-V4fnXZLcQbZa_4noRBPhp' },
      ],
    })));

    mockCommentRepository.getCommentById = jest.fn(({ commentId }) => {
      const [comment] = dummyComments.filter((item) => item.id === commentId);
      return Promise.resolve(new ReturnedComment(comment));
    });

    mockReplyRepository.getReplyById = jest.fn(({ replyId }) => {
      const [reply] = dummyReplies.filter((item) => item.id === replyId);
      return Promise.resolve(new ReturnedReply(reply));
    });

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const returnedThread = await getThreadUseCase.execute(useCasePayload);

    expect(returnedThread).toStrictEqual(expectedReturnedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockThreadRepository.getThreadById).toBeCalledTimes(1);
    expect(mockCommentRepository.getCommentById).toBeCalledTimes(2);
    expect(mockReplyRepository.getReplyById).toBeCalledTimes(2);
  });
});
