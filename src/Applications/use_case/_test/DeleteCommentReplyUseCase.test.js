const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentReplyUseCase = require('../DeleteCommentReplyUseCase');

describe('DeleteCommentReplyUseCase', () => {
  it('should orchestrating the delete comment reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.deleteCommentReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentReplyUseCase = new DeleteCommentReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    await deleteCommentReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.deleteCommentReply).toBeCalledWith(useCasePayload);
  });
});
