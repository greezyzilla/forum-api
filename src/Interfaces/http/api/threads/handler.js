const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async postThreadHandler({
    payload,
    auth: { credentials: { id: owner } },
  }, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ ...payload, owner });

    return h.response({
      status: 'success',
      data: {
        addedThread,
      },
    }).code(201);
  }

  async postCommentHandler({
    payload,
    params: { threadId },
    auth: { credentials: { id: userId } },
  }, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({ ...payload, threadId, userId });

    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  }

  async getThreadHandler({ params: { threadId } }) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const thread = await getThreadUseCase.execute({ threadId });

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }

  async deleteCommentHandler({
    params: { threadId, commentId },
    auth: { credentials: { id: userId } },
  }) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute({ threadId, commentId, userId });

    return {
      status: 'success',
    };
  }

  async postReplyHandler({
    payload,
    params: { threadId, commentId },
    auth: { credentials: { id: userId } },
  }, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      ...payload, threadId, commentId, userId,
    });

    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async deleteReplyHandler({
    params: { threadId, commentId, replyId },
    auth: { credentials: { id: userId } },
  }) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({
      threadId, commentId, replyId, userId,
    });

    return {
      status: 'success',
    };
  }

  async putLikeHandler({
    params: { threadId, commentId },
    auth: { credentials: { id: userId } },
  }) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    await likeCommentUseCase.execute({
      threadId, commentId, userId,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = ThreadsHandler;
