"""HTTP fixtures for API mode. This is not a live backend integration test."""
import os
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('KIX_TEST_BASE_URL','http://127.0.0.1:5179')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[];requests=[];mode={'value':'unauthorized'}
    page.on('pageerror',lambda error:errors.append(str(error)))
    records=[{'id':i+1,'brandId':3,'brandName':'응답 브랜드','name':f'서버 러너 {i+1}','price':100000+i*1000,'imageUrl':None,'status':'STOPPED' if i==2 else 'ON_SALE','soldOut':i==1} for i in range(9)]
    def api(route):
        url=route.request.url;parsed=urlparse(url);query=parse_qs(parsed.query)
        requests.append((parsed.path,query,route.request.headers.get('authorization','')))
        if parsed.path.endswith('/auth/login'):
            mode['value']='ok'
            route.fulfill(json={'accessToken':'ui-test-api','tokenType':'Bearer','expiresIn':3600});return
        if parsed.path.endswith('/members/me'):
            route.fulfill(json={'id':'101','role':'USER'});return
        if parsed.path.startswith('/api/products/'):
            product=next((row for row in records if str(row['id'])==parsed.path.rsplit('/',1)[-1]),None)
            if product:route.fulfill(json={**product,'description':'서버 상품 설명','options':[{'id':101,'sizeMn':250,'stock':2}]})
            else:route.fulfill(status=404,json={'detail':'상품을 찾을 수 없습니다.'})
            return
        assert parsed.path=='/api/products',parsed.path
        if mode['value']=='unauthorized':route.fulfill(status=401,json={'detail':'인증이 필요합니다.'});return
        if mode['value']=='failed':route.fulfill(status=500,json={'detail':'테스트 서버 오류'});return
        if mode['value']=='malformed':route.fulfill(json={'content':'wrong'});return
        if mode['value']=='empty':items=[]
        else:items=[row for row in records if query.get('keyword',[''])[0] in row['name']]
        number=int(query.get('page',['0'])[0]);size=int(query.get('size',['8'])[0])
        route.fulfill(json={'content':items[number*size:(number+1)*size],'page':number,'size':size,'totalElements':len(items),'totalPages':(len(items)+size-1)//size})
    page.route(base+'/api/**',api)
    page.goto(base+'/products?q=%20%20&brandId=3');page.wait_for_load_state('networkidle')
    expect(page.get_by_role('alert')).to_contain_text('인증이 필요합니다.')
    expect(page.locator('article')).to_have_count(0)
    page.get_by_role('link',name='로그인 후 조회',exact=True).click()
    page.get_by_label('이메일',exact=True).fill('ui@example.com')
    page.get_by_label('비밀번호',exact=True).fill('ui-test-password')
    page.get_by_role('button',name='로그인',exact=True).click()
    expect(page.locator('article')).to_have_count(8)
    assert requests[-1][1]['brandId']==['3']
    assert 'keyword' not in requests[-1][1]
    assert requests[-1][2]=='Bearer ui-test-api'
    expect(page.locator('article a')).to_have_count(8)
    expect(page.locator('article button')).to_have_count(0)
    expect(page.locator('article').nth(1)).to_contain_text('품절')
    expect(page.locator('article').nth(2)).to_contain_text('판매 중지')
    page.get_by_role('button',name='다음',exact=True).click()
    expect(page.locator('article')).to_have_count(1)
    assert requests[-1][1]['page']==['1'] and requests[-1][1]['brandId']==['3']
    page.get_by_placeholder('상품명 검색',exact=True).fill('러너 1')
    page.get_by_role('button',name='검색 적용',exact=True).click()
    expect(page.locator('article')).to_have_count(1)
    expect(page.locator('article')).to_contain_text('서버 러너 1')
    assert requests[-1][1]['keyword']==['러너 1'] and requests[-1][1]['brandId']==['3']
    assert requests[-1][1]['page']==['0']
    mode['value']='failed'
    page.get_by_role('link',name='초기화',exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('테스트 서버 오류')
    expect(page.locator('article')).to_have_count(0)
    mode['value']='ok'
    page.get_by_role('button',name='다시 시도',exact=True).click()
    expect(page.locator('article')).to_have_count(8)
    mode['value']='malformed'
    page.get_by_role('button',name='다음',exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('상품 응답 형식')
    expect(page.locator('article')).to_have_count(0)
    mode['value']='empty'
    page.get_by_role('button',name='다시 시도',exact=True).click()
    expect(page.get_by_text('검색 결과가 없습니다.',exact=False)).to_be_visible()
    mode['value']='ok'
    page.goto(base+'/products?page=999');page.wait_for_load_state('networkidle')
    page.get_by_role('button',name='첫 페이지로',exact=True).click()
    expect(page.locator('article')).to_have_count(8)
    before=len(requests)
    page.goto(base+'/products/1');page.wait_for_load_state('networkidle')
    expect(page.get_by_role('heading',name='서버 러너 1',exact=True)).to_be_visible()
    assert requests[before:] and all(path=='/api/products/1' for path,_,_ in requests[before:])
    expect(page.get_by_role('button',name='샘플 주문 확인',exact=True)).to_have_count(0)
    page.get_by_role('button',name='250 2개 남음',exact=True).click()
    expect(page.get_by_role('button',name='주문 준비 중',exact=True)).to_be_disabled()
    expect(page.get_by_role('button',name='샘플 좋아요: 서버 러너 1',exact=True)).to_have_count(0)
    page.goto(base+'/products/999');page.wait_for_load_state('networkidle')
    expect(page.get_by_role('alert')).to_contain_text('상품을 찾을 수 없습니다.')
    page.set_viewport_size({'width':320,'height':850})
    page.goto(base+'/products');page.wait_for_load_state('networkidle')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors,errors
    print('PASS: API-mode list fixtures, auth/Bearer, Controller params, paging/search, server stock/status, detail/404 with unavailable order/likes/reviews, error/retry/no mock fallback, malformed/empty response, out-of-range page, 320px; not a live backend test')
    browser.close()
