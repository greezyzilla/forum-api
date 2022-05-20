const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeByCommentId = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadById)
      .toBeCalledWith({ threadId: useCasePayload.threadId });
    expect(mockCommentRepository.verifyCommentById)
      .toBeCalledWith({ commentId: useCasePayload.commentId });
    expect(mockLikeRepository.verifyLikeByCommentId)
      .toBeCalledWith({ commentId: useCasePayload.commentId, userId: useCasePayload.userId });
    expect(mockLikeRepository.addLike)
      .toBeCalledWith({ commentId: useCasePayload.commentId, userId: useCasePayload.userId });
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeByCommentId = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadById)
      .toBeCalledWith({ threadId: useCasePayload.threadId });
    expect(mockCommentRepository.verifyCommentById)
      .toBeCalledWith({ commentId: useCasePayload.commentId });
    expect(mockLikeRepository.verifyLikeByCommentId)
      .toBeCalledWith({ commentId: useCasePayload.commentId, userId: useCasePayload.userId });
    expect(mockLikeRepository.removeLike)
      .toBeCalledWith({ commentId: useCasePayload.commentId, userId: useCasePayload.userId });
  });
});
