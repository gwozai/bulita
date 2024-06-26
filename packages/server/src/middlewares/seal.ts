import { SEAL_TEXT } from '@bulita/utils/const';
import { getSocketIp } from '@bulita/utils/socket';
import { Socket } from 'socket.io';
import {
    getSealIpKey,
    getSealUserKey,
    Redis,
} from '@bulita/database/redis/initRedis';

/**
 * 拦截被封禁用户的请求
 */
export default function seal(socket: Socket) {
    return async ([, , cb]: MiddlewareArgs, next: MiddlewareNext) => {
        const ip = getSocketIp(socket);
        const isSealIp = await Redis.has(getSealIpKey(ip));
        const isSealUser =
            socket.data.user &&
            (await Redis.has(getSealUserKey(socket.data.user)));

        if (isSealUser || isSealIp) {
            cb(SEAL_TEXT);
        } else {
            next();
        }
    };
}
