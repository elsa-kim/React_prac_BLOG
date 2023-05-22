import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggedIn.js';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write);

const post = new Router();
post.get('/', postsCtrl.read);
post.delete('/', checkLoggedIn, postsCtrl.remove);
// posts.put('/:id', postsCtrl.replace);
post.patch('/', checkLoggedIn, postsCtrl.update);

posts.use('/:id', postsCtrl.checkObjectId, post.routes());

export default posts;
