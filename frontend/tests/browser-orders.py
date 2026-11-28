"""UI-only tests. Auth responses are intercepted; no live backend is contacted."""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
artifacts = Path(os.environ.get('KIX_TEST_ARTIFACTS', '/private/tmp/kix-order-artifacts'))
artifacts.mkdir(parents=True, exist_ok=True)
base = os.environ.get('KIX_TEST_BASE_URL', 'http://127.0.0.1:5175')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    api_requests=[]
    page.on('pageerror', lambda error: errors.append(str(error)))
    def mock_api(route):
        url = route.request.url
        api_requests.append(url)
        if url.endswith('/auth/login'):
            route.fulfill(json={'accessToken':'browser-test-token','tokenType':'Bearer','expiresIn':3600})
        elif url.endswith('/members/me'):
            route.fulfill(json={'id':'101','role':'USER'})
        else:
            route.abort()
    page.route(base+'/api/**', mock_api)
    page.goto(base+'/products/sample-1'); page.wait_for_load_state('networkidle')
    page.get_by_role('button',name='250 1개 남음').click()
    page.get_by_role('button',name='샘플 주문 확인').click()
    expect(page).to_have_url(re.compile('/login$'))
    page.get_by_label('이메일',exact=True).fill('ui-test@example.com')
    page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.get_by_role('button',name='로그인',exact=True).click()
    expect(page).to_have_url(re.compile('/products/sample-1$'))
    page.get_by_role('button',name='250 1개 남음').click()
    page.get_by_role('button',name='샘플 주문 확인').click()
    expect(page.get_by_role('heading',name='샘플 주문 확인')).to_be_visible()
    expect(page.get_by_role('button',name='샘플 주문 체험',exact=True)).to_be_disabled()
    page.get_by_role('checkbox').check()
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts/'confirm-mobile.png'),full_page=True)
    # Same event-loop turn: both form submissions reach the UI handler before a response.
    assert page.locator('main form').evaluate("""(form) => new Promise((resolve) => {
        const button = form.querySelector('button[type=submit]');
        const observer = new MutationObserver(() => { if (button.disabled) { observer.disconnect(); resolve(true); } });
        observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });
        form.requestSubmit(); form.requestSubmit();
        setTimeout(() => { observer.disconnect(); resolve(false); }, 2000);
    })""")
    expect(page).to_have_url(re.compile('/orders/sample/sample-order-1$'))
    expect(page.get_by_role('heading',name='샘플 체험 완료')).to_be_visible()
    page.screenshot(path=str(artifacts/'complete-mobile.png'),full_page=True)
    page.get_by_role('link',name='마이페이지로').click()
    expect(page.locator('main li')).to_have_count(1)
    page.locator('main li a').click()
    expect(page.get_by_role('heading',name='샘플 주문 상세')).to_be_visible()
    # Revisit confirmation for the same logical intent: no second order or deduction.
    page.goto(base+'/orders/confirm')
    # Full navigation refreshes memory, so authentication is reset.
    page.wait_for_load_state('networkidle')
    expect(page).to_have_url(re.compile('/login$'))
    page.get_by_label('이메일',exact=True).fill('ui-test@example.com')
    page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.get_by_role('button',name='로그인',exact=True).click()
    expect(page.get_by_text('선택한 상품이 없거나 샘플 세션이 초기화되었습니다.',exact=True)).to_be_visible()
    # Start a fresh sample and return to its product without a document refresh.
    page.get_by_role('link',name='상품 선택으로').click()
    page.locator('article a').first.click()
    page.get_by_role('button',name='250 1개 남음').click()
    page.get_by_role('button',name='샘플 주문 확인').click()
    page.get_by_role('checkbox').check()
    page.get_by_role('button',name='샘플 주문 체험',exact=True).click()
    expect(page.get_by_role('heading',name='샘플 체험 완료')).to_be_visible()
    page.get_by_role('link',name='마이페이지로').click()
    page.get_by_role('link',name='상품 탐색',exact=True).last.click()
    page.locator('article a').first.click()
    expect(page.get_by_role('button',name='250 품절')).to_be_disabled()
    expect(page.get_by_role('button',name='샘플 주문 확인')).to_be_disabled()
    page.get_by_role('link',name='마이페이지',exact=True).click()
    page.screenshot(path=str(artifacts/'my-mobile.png'),full_page=True)
    expect(page.locator('main li')).to_have_count(1)
    page.get_by_role('button',name='로그아웃',exact=True).click()
    expect(page).to_have_url(re.compile('/login$'))
    page.get_by_label('이메일',exact=True).fill('another@example.com')
    page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.get_by_role('button',name='로그인',exact=True).click()
    expect(page.get_by_text('체험한 샘플 주문이 없습니다.',exact=True)).to_be_visible()
    assert page.evaluate('localStorage.length === 0 && sessionStorage.length === 0')
    assert all('/auth/login' in url or '/members/me' in url for url in api_requests),api_requests
    assert not errors,errors
    print('PASS: auth gate, consent, duplicate submission, sample completion/detail/list, stock response, refresh/logout isolation, empty draft, mobile, no real order API, no storage token, no page errors')
    browser.close()
