"""Read-only live backend smoke. Requires API-mode Vite + a running backend; no fixtures/auth writes."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('KIX_TEST_BASE_URL','http://127.0.0.1:5179')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    requests=[];errors=[]
    page.on('request',lambda request:requests.append((request.method,urlparse(request.url).path)))
    page.on('pageerror',lambda error:errors.append(str(error)))
    with page.expect_response(lambda response:urlparse(response.url).path=='/api/products') as response_info:
        page.goto(base+'/products')
    response=response_info.value
    assert response.status==200,response.status
    data=response.json()
    page.wait_for_load_state('networkidle')
    expect(page.locator('article')).to_have_count(len(data['content']))
    if not data['content']:expect(page.get_by_text('검색 결과가 없습니다.',exact=False)).to_be_visible()
    with page.expect_response(lambda response:urlparse(response.url).path=='/api/products/1') as detail_info:
        page.goto(base+'/products/1')
    detail_response=detail_info.value
    page.wait_for_load_state('networkidle')
    assert detail_response.status in [200,404],detail_response.status
    if detail_response.status==404:expect(page.get_by_role('alert')).to_be_visible()
    else:expect(page.get_by_role('heading',name=detail_response.json()['name'],exact=True)).to_be_visible()
    assert all(method=='GET' for method,path in requests if path.startswith('/api/')),requests
    assert not errors,errors
    print(f'LIVE READ PASS: list HTTP {response.status}, totalElements={data["totalElements"]}, rendered={len(data["content"])}; detail /1 HTTP {detail_response.status}; GET only; no data or backend changes; no page errors')
    browser.close()
