import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const { ObjectId } = mongoose.Types;
// HTML 필터링 시 허용할 것 설정해줌
const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  try {
    const post = await Post.findById(id);
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  // MongoDB에서 조회한 데이터의 id 값을 문자열과 비교할 땐 반드시 .toString() 해야함
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
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
  if (!validation) {
    ctx.status = 400;
    ctx.body = validation;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// html 없애고 내용 너무 길면 200자로 제한하는 함수
const removeHtmlAndShorten = (body) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`;
};

// GET /api/posts?username=&tag=&page=
export const list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해줘야 함
  // 값 주어지지 않았다면 1을 기본으로
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag, username 값이 유효하면 객체안에 넣고 그렇지않으면 넣지않음
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-page', Math.ceil(postCount / 10));
    // 글자수 200자로 제한, 뒤에 ...
    ctx.body = posts.map((post) => ({
      ...post,
      body: removeHtmlAndShorten(post.body),
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET /api/posts/:id
export const read = (ctx) => {
  ctx.body = ctx.state.post;
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

  const nextData = { ...ctx.request.body };
  if (nextData.body) {
    nextData.body = sanitizeHtml(nextData.body);
  }
  try {
    const post = await Post.findByIdAndUpdate(id, nextData, {
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
