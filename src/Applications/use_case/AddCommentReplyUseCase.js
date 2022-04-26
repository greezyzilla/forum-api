const RegisterCommentReply = require('../../Domains/threads/entities/RegisterCommentReply');

class AddCommentReplyUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const registerCommentReply = new RegisterCommentReply(useCasePayload);

    return this._threadRepository.addCommentReply(registerCommentReply);
  }
}

module.exports = AddCommentReplyUseCase;
