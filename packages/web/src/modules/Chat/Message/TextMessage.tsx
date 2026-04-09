import React from 'react';

import expressions from '@bulita/utils/expressions';
import { TRANSPARENT_IMAGE } from '@bulita/utils/const';
import { marked } from 'marked';
import Style from './Message.less';
// import DOMPurify from 'dompurify'

interface TextMessageProps {
    content: string;
}

function formatTextContent(raw: string) {
    return raw
        .replace(/<[^>]*?>/gi, '')
        .replace(/(.*?)<\/[^>]*?>/gi, '')
        .replace(/\n/g, '<br>')
        .replace(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}(\.[a-z]{2,6})?\b(:[0-9]{2,5})?([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
            (r) =>
                `<a class="${Style.selecteAble}" href="${r}" rel="noopener noreferrer" target="_blank">${r}</a>`,
        )
        .replace(/#\(([\u4e00-\u9fa5a-z]+)\)/g, (r, e) => {
            const index = expressions.default.indexOf(e);
            if (index !== -1) {
                return `<img class="${Style.baidu} ${
                    Style.selecteAble
                }" src="${TRANSPARENT_IMAGE}" style="background-position: left ${
                    -30 * index
                }px;" onerror="this.style.display='none'" alt="${r}">`;
            }
            return r;
        });
}

function parseQuotedText(raw: string) {
    const separatorIndex = raw.indexOf('\n\n');
    if (separatorIndex <= 0) {
        return null;
    }
    const quoteLine = raw.slice(0, separatorIndex).trim();
    const mainText = raw.slice(separatorIndex + 2);
    if (!quoteLine.startsWith('> 引用 ')) {
        return null;
    }
    const quotedRaw = quoteLine.replace('> 引用 ', '').trim();
    const colonIndex = quotedRaw.indexOf(':');
    if (colonIndex <= 0) {
        return {
            title: '引用消息',
            preview: quotedRaw,
            message: mainText,
        };
    }
    const username = quotedRaw.slice(0, colonIndex).trim();
    const preview = quotedRaw.slice(colonIndex + 1).trim();
    return {
        title: `引用 ${username}`,
        preview,
        message: mainText,
    };
}

function TextMessage(props: TextMessageProps) {
    const quoteData = parseQuotedText(props.content);
    if (quoteData) {
        const quotePreview = formatTextContent(quoteData.preview);
        const mainContent = formatTextContent(quoteData.message);
        return (
            <div className={`${Style.textMessage} ${Style.quotedTextMessage}`}>
                <div className={Style.quoteCard}>
                    <p className={Style.quoteTitle}>{quoteData.title}</p>
                    <div
                        className={Style.quotePreview}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: quotePreview }}
                    />
                </div>
                {quoteData.message.trim() ? (
                    <div
                        className={Style.quoteMain}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: mainContent }}
                    />
                ) : null}
            </div>
        );
    }

    const content = formatTextContent(props.content);

    return (
        <div
            className={Style.textMessage}
            style={{ wordWrap: 'break-word' }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

function TextMessageBot(props: TextMessageProps) {
    // const reg = /(http:\/\/|https:\/\/|www)(([\w#]|=|\?|\.|\/|&|~|-|[\u200B-\u200D\uFEFF])+)/g;
    // eslint-disable-next-line react/destructuring-assignment
    let content = marked(props.content);
    content = content
        .replace(
            /<a /g,
            '<a style="color: #1d9cf0;text-decoration: none;" target="_blank" ',
        )
        .replace(
            /<img /g,
            `<img class="${Style.image}" alt="消息图片" width="250" height="250" `,
        );
    content = content.replace(/#\(([\u4e00-\u9fa5a-z]+)\)/g, (r, e) => {
        const index = expressions.default.indexOf(e);
        if (index !== -1) {
            return `<img class="${Style.baidu} ${
                Style.selecteAble
            }" src="${TRANSPARENT_IMAGE}" style="background-position: left ${
                -30 * index
            }px;" onerror="this.style.display='none'" alt="${r}">`;
        }
        return r;
    });
    return (
        <div
            className={`${Style.textMessage} ${Style.botMarkdown}`}
            style={{ wordWrap: 'break-word' }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

export { TextMessage, TextMessageBot };
