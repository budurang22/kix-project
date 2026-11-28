"""Inject test image URLs into the sample module; never contact an external image host."""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('KIX_TEST_BASE_URL','http://127.0.0.1:5178')
artifacts=Path(os.environ.get('KIX_TEST_ARTIFACTS','/private/tmp/kix-image-artifacts'))
artifacts.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    def images_in_samples(route):
        response=route.fetch()
        source=response.text()
        assert 'description:' in source
        source=source.replace('description:', 'imageUrl: index === 0 ? "/ui-product-ok.svg" : index === 1 ? "/ui-product-missing.svg" : index === 2 ? "javascript:window.uiImageUnsafe=1" : null, description:',1)
        route.fulfill(response=response,body=source)
    page.route(re.compile(re.escape(base)+r'/src/api/mocks/products\.js(?:\?.*)?$'),images_in_samples)
    page.route(base+'/ui-product-ok.svg',lambda route:route.fulfill(content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect x="20" y="50" width="160" height="100" fill="#111111"/></svg>'))
    page.route(base+'/ui-product-missing.svg',lambda route:route.fulfill(status=404,body='missing test image'))
    page.goto(base+'/products');page.wait_for_load_state('networkidle')
    image=page.get_by_role('img',name='로우 스니커즈 샘플',exact=True)
    expect(image).to_be_visible()
    assert image.evaluate('(element) => element.complete && element.naturalWidth > 0')
    expect(page.get_by_role('img',name='하이 스니커즈 샘플 이미지 준비 중',exact=True)).to_be_visible()
    expect(page.get_by_role('img',name='코트 스니커즈 샘플 이미지 준비 중',exact=True)).to_be_visible()
    assert page.evaluate('window.uiImageUnsafe === undefined')
    page.screenshot(path=str(artifacts/'image-list.png'),full_page=True)
    page.locator('article a').first.click()
    expect(page.get_by_role('img',name='로우 스니커즈 샘플',exact=True)).to_be_visible()
    page.set_viewport_size({'width':390,'height':850})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts/'image-detail-mobile.png'),full_page=True)
    page.goto(base+'/products/sample-2');page.wait_for_load_state('networkidle')
    expect(page.get_by_role('img',name='하이 스니커즈 샘플 이미지 준비 중',exact=True)).to_be_visible()
    assert not errors,errors
    print('PASS: safe local image rendering, list/detail image propagation, 404 fallback, unsupported URL fallback, mobile no overflow; no external assets or page errors')
    browser.close()
