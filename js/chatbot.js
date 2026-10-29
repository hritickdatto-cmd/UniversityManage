(() => {
    const sessionUser = window.UMSAuth && window.UMSAuth.getCurrentUser();
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const isPublicPage = pathname === '/' || pathname === '/index.html';
    const chatRole = isPublicPage ? 'public' : sessionUser && sessionUser.role;
    if (!isPublicPage && (!sessionUser || !['student', 'teacher'].includes(chatRole))) return;

    const roleLabel = chatRole === 'public' ? 'Campus information assistant' :
        chatRole === 'teacher' ? 'Faculty assistant' : 'Student assistant';
    const style = document.createElement('style');
    style.textContent = `
        .ums-chat-launcher{position:fixed;right:24px;bottom:24px;z-index:1200;width:58px;height:58px;border:0;border-radius:50%;background:#006a4e;color:#fff;box-shadow:0 8px 24px #001e1640;font-size:25px;cursor:pointer}
        .ums-chat-launcher:hover{background:#00543e}
        .ums-chat-panel{position:fixed;right:24px;bottom:94px;z-index:1200;display:none;width:min(390px,calc(100vw - 32px));height:min(580px,calc(100dvh - 120px));min-height:360px;grid-template-rows:auto 1fr auto auto;background:var(--bg-surface,#fff);color:var(--text-primary,#172033);border:1px solid var(--border-color,#d9e0e8);border-radius:12px;box-shadow:0 18px 55px #14213830;overflow:hidden}
        .ums-chat-panel.is-open{display:grid}
        .ums-chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#006a4e;color:#fff}
        .ums-chat-title{font-size:14px;font-weight:700}
        .ums-chat-subtitle{margin-top:3px;font-size:11px;opacity:.82}
        .ums-chat-close{width:34px;height:34px;border:0;border-radius:6px;background:transparent;color:#fff;font-size:22px;cursor:pointer}
        .ums-chat-messages{display:flex;flex-direction:column;gap:10px;padding:14px;overflow-y:auto;background:var(--bg-main,#f7f9fb)}
        .ums-chat-message{max-width:88%;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
        .ums-chat-message.assistant{align-self:flex-start;background:var(--bg-surface,#fff);border:1px solid var(--border-color,#d9e0e8)}
        .ums-chat-message.user{align-self:flex-end;background:#006a4e;color:#fff}
        .ums-chat-answer-heading{display:block;margin:8px 0 4px;font-size:13px}
        .ums-chat-answer-paragraph{margin:0 0 6px}
        .ums-chat-answer-list{margin:3px 0 7px 18px;padding:0}
        .ums-chat-answer-list li{margin:2px 0;padding-left:2px}
        .ums-chat-caret{display:inline-block;width:1px;height:1em;margin-left:2px;background:currentColor;vertical-align:text-bottom;animation:ums-chat-blink .8s steps(2,start) infinite}
        .ums-chat-sources{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:7px;border-top:1px solid var(--border-color,#d9e0e8);font-size:11px}
        .ums-chat-sources a{color:#006a4e;text-decoration:underline;overflow-wrap:anywhere}
        @keyframes ums-chat-blink{to{visibility:hidden}}
        .ums-chat-suggestions{display:flex;gap:6px;padding:0 12px 10px;overflow-x:auto}
        .ums-chat-suggestion{flex:none;padding:6px 9px;border:1px solid var(--border-color,#d9e0e8);border-radius:16px;background:var(--bg-surface,#fff);color:var(--text-primary,#172033);font-size:11px;cursor:pointer}
        .ums-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--border-color,#d9e0e8);background:var(--bg-surface,#fff)}
        .ums-chat-input{min-width:0;flex:1;padding:10px 11px;border:1px solid var(--border-color,#d9e0e8);border-radius:8px;background:var(--bg-main,#f7f9fb);color:inherit;font:inherit;font-size:13px}
        .ums-chat-send{width:42px;flex:none;border:0;border-radius:8px;background:#006a4e;color:#fff;font-size:18px;cursor:pointer}
        .ums-chat-send:disabled,.ums-chat-input:disabled{opacity:.55;cursor:wait}
        .ums-chat-status{min-height:16px;padding:0 13px 8px;color:var(--text-muted,#64748b);font-size:11px;background:var(--bg-surface,#fff)}
        @media(max-width:520px){.ums-chat-launcher{right:16px;bottom:16px}.ums-chat-panel{right:8px;bottom:84px;width:calc(100vw - 16px);height:min(620px,calc(100dvh - 100px))}}
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.innerHTML = `
        <button class="ums-chat-launcher" type="button" aria-label="Open ${roleLabel}" aria-expanded="false" title="Ask the portal assistant">✦</button>
        <section class="ums-chat-panel" aria-label="${roleLabel}" aria-hidden="true">
            <header class="ums-chat-header">
                <div><div class="ums-chat-title">${roleLabel}</div><div class="ums-chat-subtitle">${chatRole === 'public' ? 'Public website information' : 'Website and your academic profile'}</div></div>
                <button class="ums-chat-close" type="button" aria-label="Close assistant">&times;</button>
            </header>
            <div class="ums-chat-messages" role="log" aria-live="polite"></div>
            <div class="ums-chat-suggestions" aria-label="Suggested questions"></div>
            <div>
                <form class="ums-chat-form">
                    <input class="ums-chat-input" type="text" maxlength="1200" placeholder="${chatRole === 'public' ? 'Ask about BAUET...' : 'Ask about your portal...'}" autocomplete="off" aria-label="Your question" required>
                    <button class="ums-chat-send" type="submit" aria-label="Send question">↑</button>
                </form>
                <div class="ums-chat-status" role="status"></div>
            </div>
        </section>
    `;
    document.body.appendChild(widget);

    const launcher = widget.querySelector('.ums-chat-launcher');
    const panel = widget.querySelector('.ums-chat-panel');
    const closeButton = widget.querySelector('.ums-chat-close');
    const messageList = widget.querySelector('.ums-chat-messages');
    const suggestionList = widget.querySelector('.ums-chat-suggestions');
    const form = widget.querySelector('.ums-chat-form');
    const input = widget.querySelector('.ums-chat-input');
    const sendButton = widget.querySelector('.ums-chat-send');
    const status = widget.querySelector('.ums-chat-status');
    const history = [];
    let busy = false;

    function addMessage(role, text) {
        const message = document.createElement('div');
        message.className = `ums-chat-message ${role}`;
        message.textContent = text;
        messageList.appendChild(message);
        messageList.scrollTop = messageList.scrollHeight;
    }

    function addAnswerSources(message, websiteSources, citations) {
        const sourceList = document.createElement('div');
        sourceList.className = 'ums-chat-sources';
        const links = [];

        for (const source of websiteSources) {
            if (typeof source !== 'string') continue;
            const link = document.createElement('a');
            link.href = `/${source.split('/').map(encodeURIComponent).join('/')}`;
            link.textContent = source;
            links.push(link);
        }
        for (const citation of citations) {
            if (!citation || typeof citation.uri !== 'string') continue;
            let parsedUrl;
            try {
                parsedUrl = new URL(citation.uri);
            } catch {
                continue;
            }
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) continue;
            const link = document.createElement('a');
            link.href = parsedUrl.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = citation.title || parsedUrl.hostname;
            links.push(link);
        }

        if (!links.length) return;
        const label = document.createElement('strong');
        label.textContent = 'Sources:';
        sourceList.appendChild(label);
        for (const link of links) sourceList.appendChild(link);
        message.appendChild(sourceList);
    }

    function appendFormattedLine(parent, text) {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = part.slice(2, -2);
                parent.appendChild(strong);
            } else {
                parent.appendChild(document.createTextNode(part));
            }
        }
    }

    function renderFormattedAnswer(container, text) {
        container.replaceChildren();
        let activeList = null;
        let activeListType = '';

        for (const line of text.split(/\r?\n/)) {
            const heading = line.match(/^###\s+(.+)$/);
            const listItem = line.match(/^\s*[-*]\s+(.+)$/);
            if (!line.trim()) {
                activeList = null;
                activeListType = '';
                continue;
            }
            if (heading) {
                activeList = null;
                activeListType = '';
                const title = document.createElement('strong');
                title.className = 'ums-chat-answer-heading';
                appendFormattedLine(title, heading[1]);
                container.appendChild(title);
                continue;
            }
            if (listItem) {
                if (!activeList || activeListType !== 'ul') {
                    activeList = document.createElement('ul');
                    activeList.className = 'ums-chat-answer-list';
                    container.appendChild(activeList);
                    activeListType = 'ul';
                }
                const item = document.createElement('li');
                appendFormattedLine(item, listItem[1]);
                activeList.appendChild(item);
                continue;
            }
            activeList = null;
            activeListType = '';
            const paragraph = document.createElement('div');
            paragraph.className = 'ums-chat-answer-paragraph';
            appendFormattedLine(paragraph, line);
            container.appendChild(paragraph);
        }
    }

    function typeAssistantAnswer(answer, websiteSources, citations) {
        const message = document.createElement('div');
        message.className = 'ums-chat-message assistant';
        const answerText = document.createElement('div');
        const caret = document.createElement('span');
        caret.className = 'ums-chat-caret';
        caret.setAttribute('aria-hidden', 'true');
        message.append(answerText, caret);
        messageList.appendChild(message);

        return new Promise(resolve => {
            let offset = 0;
            const stepSize = Math.max(1, Math.ceil(answer.length / 90));

            function typeNext() {
                offset = Math.min(answer.length, offset + stepSize);
                answerText.textContent = answer.slice(0, offset);
                messageList.scrollTop = messageList.scrollHeight;
                if (offset < answer.length) {
                    setTimeout(typeNext, 16);
                    return;
                }
                caret.remove();
                renderFormattedAnswer(answerText, answer);
                addAnswerSources(message, websiteSources, citations);
                messageList.scrollTop = messageList.scrollHeight;
                resolve();
            }
            typeNext();
        });
    }

    function setOpen(open) {
        panel.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        launcher.setAttribute('aria-expanded', String(open));
        if (open) input.focus();
    }

    function getSuggestions() {
        if (chatRole === 'public') {
            return [
                'What departments are offered?',
                'Where is BAUET located?',
                'How do I register?',
                'How do I sign in?',
                'What can I do in the portal?',
                'Show the latest notices'
            ];
        }
        return chatRole === 'teacher' ? [
            'My teaching profile',
            'How do I take attendance?',
            'How do I submit grades?',
            'How do I view my courses?',
            'How do I manage assignments?',
            'Where can I find notices?'
        ] : [
            'My academic profile',
            'How do I check results?',
            'How do I view my courses?',
            'How do I check attendance?',
            'How do I check my fees?',
            'Where can I find notices?'
        ];
    }

    function getChatApiUrl() {
        if (window.UMS_CHAT_API) return window.UMS_CHAT_API;
        const localHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (localHost && window.location.port !== '3000') {
            return `${window.location.protocol}//${window.location.hostname}:3000/api/chat`;
        }
        return '/api/chat';
    }

    launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    closeButton.addEventListener('click', () => setOpen(false));
    for (const question of getSuggestions()) {
        const suggestion = document.createElement('button');
        suggestion.className = 'ums-chat-suggestion';
        suggestion.type = 'button';
        suggestion.textContent = question;
        suggestion.addEventListener('click', () => {
            input.value = question;
            form.requestSubmit();
        });
        suggestionList.appendChild(suggestion);
    }

    function waitForFirebaseUser(firebase) {
        if (firebase.auth.currentUser) return Promise.resolve(firebase.auth.currentUser);
        return new Promise(resolve => {
            const unsubscribe = firebase.onAuthStateChanged(firebase.auth, user => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question || busy) return;

        const firebase = window.UMSFirebase;
        if (chatRole !== 'public' && !firebase) {
            status.textContent = 'Authentication service is unavailable. Reload the page and try again.';
            return;
        }

        busy = true;
        input.disabled = true;
        sendButton.disabled = true;
        status.textContent = 'Searching website, database and the web...';
        addMessage('user', question);
        input.value = '';

        try {
            const payload = { messages: [...history, { role: 'user', text: question }] };
            if (chatRole !== 'public') {
                const authUser = await waitForFirebaseUser(firebase);
                if (!authUser || authUser.uid !== sessionUser.uid) {
                    throw new Error('Your sign-in session expired. Sign in again to use the assistant.');
                }
                payload.idToken = await authUser.getIdToken();
            }
            const response = await fetch(getChatApiUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'The assistant could not answer. Try again.');
            await typeAssistantAnswer(result.answer, result.websiteSources || [], result.citations || []);
            history.push({ role: 'user', text: question }, { role: 'assistant', text: result.answer });
            if (history.length > 8) history.splice(0, history.length - 8);
            status.textContent = result.sourceMode === 'official-updates' ? 'Live official BAUET news and database notices.' :
                result.fallback ? 'Showing a matching verified website excerpt.' :
                result.citations && result.citations.length ? 'Grounded in portal data and linked web sources.' :
                chatRole === 'public' ? 'Grounded in public website and database information.' : 'Grounded in your authorized portal data.';
        } catch (error) {
            const errorMessage = error instanceof TypeError ?
                'Chat server is unreachable. Start it with npm run dev, then reload this page.' :
                error.message || 'The assistant is temporarily unavailable.';
            addMessage('assistant', errorMessage);
            status.textContent = error instanceof TypeError ? 'Waiting for the local chat server on port 3000.' : 'Please try again in a moment.';
        } finally {
            busy = false;
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    });

    const welcomeMessage = chatRole === 'public' ?
        'Hello! Ask about BAUET, departments, registration, or published notices.' :
        chatRole === 'student' ?
        'Hello! Ask me about your academic profile, results, notices, or student portal pages.' :
        'Hello! Ask me about your faculty profile, attendance, results, or teacher portal pages.';
    addMessage('assistant', welcomeMessage);
})();