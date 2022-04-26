class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.getThreadById(useCasePayload);
  }
}

module.exports = GetThreadUseCase;
