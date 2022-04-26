class DeleteCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.deleteComment(useCasePayload);
  }
}

module.exports = DeleteCommentUseCase;
