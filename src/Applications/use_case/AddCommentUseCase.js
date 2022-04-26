const RegisterComment = require('../../Domains/threads/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const registerComment = new RegisterComment(useCasePayload);

    return this._threadRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
