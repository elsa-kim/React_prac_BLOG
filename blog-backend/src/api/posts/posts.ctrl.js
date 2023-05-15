import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

/*
POST /api/posts
{
  title:'제목',
  body:'내용',
  tags:['태그1', '태그2']
}
*/
export const write = async (ctx) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(), // required() 있으면 필수 항목
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(), // 문자열로 이뤄진 배열
  });

  // 검증 후 검증실패인 경우 에러 처리
  const validation = schema.validate(ctx.request.body);
  if (validation) {
    ctx.status = 400;
    ctx.body = validation;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET /api/posts
export const list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET /api/posts/:id
export const read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// DELETE /api/posts/:id
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content (성공했지만 응답할 데이터 없음)
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
PATCH /api/posts/:id
{
  title:'수정',
  body:'수정 내용',
  tags:['수정', '태그']
}
*/
export const update = async (ctx) => {
  const { id } = ctx.params;
  // write 에서 사용한 schema 와 비슷한데 required()가 없음
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증 후 검증실패인 경우 에러 처리
  const validation = schema.validate(ctx.request.body);
  if (validation) {
    ctx.status = 400;
    ctx.body = validation;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값 설정하면 업데이트 된 데이터 반환함, false일때는 업데이트되기 전 데이터 반환
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
