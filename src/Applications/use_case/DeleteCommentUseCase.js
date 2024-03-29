class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, userId }) {
    await this._threadRepository.verifyThreadById({ threadId });
    await this._commentRepository.verifyCommentOwner({ commentId, userId });

    await this._commentRepository.deleteComment({ commentId });
  }
}

module.exports = DeleteCommentUseCase;
