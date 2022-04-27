const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadById)
      .toBeCalledWith({ threadId: useCasePayload.threadId });
    expect(mockCommentRepository.verifyCommentById)
      .toBeCalledWith({ commentId: useCasePayload.commentId });
    expect(mockReplyRepository.deleteReply)
      .toBeCalledWith({ replyId: useCasePayload.replyId, userId: useCasePayload.userId });
  });
});
