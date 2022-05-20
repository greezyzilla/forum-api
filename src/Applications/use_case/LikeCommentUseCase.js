class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute({ threadId, commentId, userId }) {
    await this._threadRepository.verifyThreadById({ threadId });
    await this._commentRepository.verifyCommentById({ commentId });
    const isLiked = await this._likeRepository.verifyLikeByCommentId({ commentId, userId });

    if (isLiked) await this._likeRepository.removeLike({ commentId, userId });
    else await this._likeRepository.addLike({ commentId, userId });
  }
}

module.exports = LikeCommentUseCase;
