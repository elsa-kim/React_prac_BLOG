import Joi from 'joi';
import User from '../../models/user.js';

/*
POST /api/auth/register
{
    username : 'sohyun',
    password : 'mypass123'
}
*/
export const register = async (ctx) => {
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const validation = schema.validate(ctx.request.body);
  if (validation.error) {
    ctx.status = 400;
    ctx.body = validation.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username 이미 존재하는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409;
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// POST /api/auth/login
export const login = async (ctx) => {
  const { username, password } = ctx.request.body;
  console.log(username);
  // username, password 없으면 에러 처리
  if (!username || !password) {
    ctx.status = 401;
    return;
  }

  try {
    const user = await User.findByUsername(username);
    console.log(user);
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();
    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET api/auth/check
export const check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};

// POST /api/auth/logout
export const logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204;
};
