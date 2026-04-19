import {Router} from 'express'
import { registeruser,loginuser,logoutuser ,getme} from '../controllers/auth.controller.js';
import authmiddleware from '../middleware/auth.middleware.js';
const authrouter=Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access   Public
 */
authrouter.post('/register',registeruser)

/**
 * @route POST /api/auth/login
 * @description login a  user
 * @access   Public
 */

authrouter.post('/login',loginuser)

/**
 * @route GET /api/auth/logout
 * @description logout a  user
 * @access   Public
 */
authrouter.get('/logout',logoutuser)

/**
 * @route GET /api/auth/get-me
 * @description get user details
 * @access Private
 */

authrouter.get('/getme',authmiddleware,getme)
export default authrouter