import { isValidObjectId, Types } from '@bulita/database/mongoose';
import assert from 'assert';
import User from '@bulita/database/mongoose/models/user';
import Group from '@bulita/database/mongoose/models/group';
import Message from '@bulita/database/mongoose/models/message';
import { createOrUpdateHistory } from '@bulita/database/mongoose/models/history';

export async function updateHistory(
    ctx: Context<{ userId: string; linkmanId: string; messageId: string }>,
) {
    const { linkmanId, messageId } = ctx.data;
    const self = ctx.socket.user.toString();
    if (!Types.ObjectId.isValid(messageId)) {
        return {
            msg: `not update with invalid messageId:${messageId}`,
        };
    }

    // @ts-ignore
    const [user, linkman, message] = await Promise.all([
        User.findOne({ _id: self }),
        isValidObjectId(linkmanId)
            ? Group.findOne({ _id: linkmanId })
            : User.findOne({ _id: linkmanId.replace(self, '') }),
        Message.findOne({ _id: messageId }),
    ]);
    assert(user, '用户不存在');
    assert(linkman, '联系人不存在');
    // assert(message, '消息不存在');
    assert(message, '消息已被自动清理 请刷新');

    await createOrUpdateHistory(self, linkmanId, messageId);

    return {
        msg: 'ok',
    };
}
