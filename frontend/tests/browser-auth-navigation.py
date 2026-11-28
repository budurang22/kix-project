"""Browser auth lifecycle tests with intercepted responses; no real account writes."""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('KIX_TEST_BASE_URL','http://127.0.0.1:5180')
artifacts=Path(os.environ.get('KIX_TEST_ARTIFACTS','/private/tmp/kix-quality-artifacts'))
artifacts.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    mode={'value':'hold-member'};held=[];calls=[];errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    def api(route):
        path=route.request.url.split('/api/')[-1];calls.append(path)
        if path=='auth/login':
            if mode['value']=='bad-login':route.fulfill(status=401,json={'detail':'로그인 정보를 확인해 주세요.'});return
            route.fulfill(json={'accessToken':'ui-test-auth','tokenType':'Bearer','expiresIn':1 if mode['value']=='expiry' else 3600});return
        if path=='members/me':
            if mode['value']=='hold-member':held.append(route);return
            route.fulfill(json={'id':'101','role':'USER'});return
        if path=='auth/signup':
            if mode['value']=='duplicate':route.fulfill(status=409,json={'detail':'이미 등록된 이메일입니다.'});return
            route.fulfill(status=201,json={'id':101,'email':'ui@example.com','nickname':'테스트'});return
        route.abort()
    page.route(base+'/api/**',api)
    def fill_login():
        page.get_by_label('이메일',exact=True).fill('ui@example.com')
        page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.goto(base+'/login');page.wait_for_load_state('networkidle')
    expect(page).to_have_title('로그인 | KIX.')
    fill_login();page.get_by_role('button',name='로그인',exact=True).click()
    expect(page.get_by_role('button',name='요청 중…',exact=True)).to_be_disabled()
    page.get_by_role('link',name='상품 탐색',exact=True).click()
    expect(page).to_have_title('상품 탐색 | KIX.')
    expect(page.locator('#main')).to_be_focused()
    assert held
    try:held.pop().fulfill(json={'id':'101','role':'USER'})
    except Exception:pass # The request has been aborted by the page cleanup.
    page.wait_for_load_state('networkidle')
    expect(page.get_by_role('link',name='로그인',exact=True)).to_be_visible()
    expect(page.get_by_role('button',name='로그아웃',exact=True)).to_have_count(0)
    # Filtering the same page keeps keyboard focus on the query input.
    page.get_by_placeholder('상품명 또는 브랜드').fill('로우')
    page.get_by_placeholder('상품명 또는 브랜드').press('Enter')
    expect(page.locator('article')).to_have_count(3)
    expect(page.get_by_placeholder('상품명 또는 브랜드')).to_be_focused()
    mode['value']='bad-login'
    page.get_by_role('link',name='로그인',exact=True).click()
    fill_login();before=calls.count('auth/login')
    page.locator('main form').evaluate('(form)=>{form.requestSubmit();form.requestSubmit();}')
    expect(page.get_by_role('alert')).to_contain_text('로그인 정보를 확인해 주세요.')
    assert calls.count('auth/login')==before+1
    page.get_by_role('link',name='회원가입',exact=True).click()
    expect(page).to_have_title('회원가입 | KIX.')
    page.get_by_label('이메일',exact=True).fill('ui@example.com')
    page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.get_by_label('닉네임',exact=True).fill('테스트')
    mode['value']='duplicate'
    page.get_by_role('button',name='가입하기',exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('이미 등록된 이메일')
    mode['value']='signup-ok'
    page.get_by_role('button',name='가입하기',exact=True).click()
    expect(page).to_have_title('로그인 | KIX.')
    expect(page.get_by_role('status')).to_contain_text('회원가입이 완료되었습니다.')
    mode['value']='expiry'
    fill_login();page.get_by_role('button',name='로그인',exact=True).click()
    expect(page).to_have_title('마이페이지 | KIX.')
    expect(page.get_by_role('button',name='로그아웃',exact=True)).to_be_visible()
    expect(page).to_have_title('로그인 | KIX.',timeout=5000)
    mode['value']='ok'
    fill_login();page.get_by_role('button',name='로그인',exact=True).click()
    expect(page).to_have_title('마이페이지 | KIX.')
    page.get_by_role('button',name='로그아웃',exact=True).click()
    expect(page).to_have_title('로그인 | KIX.')
    assert page.evaluate('localStorage.length===0 && sessionStorage.length===0')
    assert not errors,errors
    # Inject a render exception into detail only, then verify route recovery.
    failure=browser.new_page(viewport={'width':390,'height':850})
    def break_detail(route):
        response=route.fetch();source=response.text()
        marker='function ProductDetailPage() {'
        assert marker in source
        route.fulfill(response=response,body=source.replace(marker,marker+' throw new Error("UI_TEST_RENDER_FAILURE");',1))
    failure.route(re.compile(re.escape(base)+r'/src/pages/ProductDetailPage\.jsx(?:\?.*)?$'),break_detail)
    failure.goto(base+'/products/sample-1');failure.wait_for_load_state('networkidle')
    expect(failure.get_by_role('heading',name='화면을 표시하지 못했습니다')).to_be_focused()
    expect(failure).to_have_title('화면 오류 | KIX.')
    expect(failure.locator('body')).not_to_contain_text('UI_TEST_RENDER_FAILURE')
    assert failure.evaluate('document.documentElement.scrollWidth<=innerWidth')
    failure.screenshot(path=str(artifacts/'screen-error-mobile.png'),full_page=True)
    failure.get_by_role('link',name='홈으로 이동',exact=True).click()
    expect(failure).to_have_title('홈 | KIX.')
    expect(failure.get_by_role('heading',name='GET YOUR NEXT KICKS.')).to_be_visible()
    expect(failure.locator('#main')).to_be_focused()
    browser.close()
    print('PASS: aborted member request cannot log in/navigate late, login duplicate/error, signup conflict/success, expiry/logout, page title/focus, render error safe fallback/mobile/route recovery; fixtures only')
