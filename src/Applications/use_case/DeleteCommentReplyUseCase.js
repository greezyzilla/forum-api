class DeleteCommentReplyUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.deleteCommentReply(useCasePayload);
  }
}

module.exports = DeleteCommentReplyUseCase;
