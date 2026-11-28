"""Read-only product integration checks. Fixture self-test is explicit and never a live pass."""
import argparse
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--fixture-self-test', action='store_true', help='Intercept product GETs with contract fixtures; not a backend test.')
parser.add_argument('--fixture-empty', action='store_true', help='Self-test an empty catalog; expected exit code 2.')
args = parser.parse_args()
if args.fixture_empty and not args.fixture_self_test: parser.error('--fixture-empty requires --fixture-self-test')
base = os.environ.get('KIX_TEST_BASE_URL', 'http://127.0.0.1:5179').rstrip('/')
artifacts = Path(os.environ.get('KIX_TEST_ARTIFACTS', '/private/tmp/kix-product-live-artifacts'))
artifacts.mkdir(parents=True, exist_ok=True)
report = {'mode': 'fixture-self-test' if args.fixture_self_test else 'live-read', 'complete': False, 'checks': [], 'api_gets': 0}

def record(name):
    report['checks'].append(name)

def install_fixtures(page):
    # Source shape: docs/06-api-spec.md 3.x. No DB writes or auth interception.
    products = [
        {'id': 14, 'brandId': 14, 'brandName': 'Nike', 'name': '[샘플] 덩크 로우', 'price': 139000, 'imageUrl': None, 'status': 'ON_SALE', 'soldOut': False, 'description': '샘플', 'options': [{'id': 14, 'sizeMm': 260, 'stock': 3}, {'id': 15, 'sizeMm': 270, 'stock': 0}]},
        {'id': 13, 'brandId': 13, 'brandName': 'Other', 'name': '[샘플] 품절 상품', 'price': 99000, 'imageUrl': None, 'status': 'ON_SALE', 'soldOut': True, 'description': '', 'options': [{'id': 13, 'sizeMm': 260, 'stock': 0}]},
        {'id': 12, 'brandId': 14, 'brandName': 'Nike', 'name': '[샘플] 판매 중지', 'price': 129000, 'imageUrl': None, 'status': 'STOPPED', 'soldOut': False, 'description': '', 'options': [{'id': 12, 'sizeMm': 250, 'stock': 2}]},
    ]
    if args.fixture_empty: products = []
    def respond(route):
        assert route.request.method == 'GET', 'Read-only verification sent a write request'
        parsed = urlparse(route.request.url)
        query = parse_qs(parsed.query)
        if parsed.path == '/api/products':
            brand = query.get('brandId', [''])[0]
            if brand and not brand.isdigit():
                route.fulfill(status=400, json={'title': 'Bad Request', 'status': 400, 'detail': '입력값이 올바르지 않습니다.'}); return
            matches = [product for product in products if (not brand or str(product['brandId']) == brand) and query.get('keyword', [''])[0] in product['name']]
            number = int(query.get('page', ['0'])[0]); size = int(query.get('size', ['20'])[0])
            content = [{key: value for key, value in product.items() if key not in ['options', 'description']} for product in matches[number*size:(number+1)*size]]
            route.fulfill(json={'content': content, 'page': number, 'size': size, 'totalElements': len(matches), 'totalPages': (len(matches)+size-1)//size}); return
        product = next((product for product in products if str(product['id']) == parsed.path.rsplit('/', 1)[-1]), None)
        if product: route.fulfill(json=product)
        else: route.fulfill(status=404, json={'title': 'Not Found', 'status': 404, 'detail': '상품을 찾을 수 없습니다.'})
    page.route(base + '/api/**', respond)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    requests = []; errors = []
    page.on('request', lambda request: requests.append((request.method, urlparse(request.url).path)))
    page.on('pageerror', lambda error: errors.append(str(error)))
    if args.fixture_self_test: install_fixtures(page)
    def navigate(path, api_path, status=200):
        with page.expect_response(lambda response: urlparse(response.url).path == api_path, timeout=10000) as response_info:
            page.goto(base + path)
        response = response_info.value
        if response.status != status:
            raise RuntimeError(f'{api_path}: HTTP {response.status}, expected {status}. Confirm backend is running and Vite uses API mode.')
        data = response.json()
        page.wait_for_load_state('networkidle')
        return data
    try:
        listing = navigate('/products', '/api/products')
        report['total_products'] = listing['totalElements']
        expect(page.locator('article')).to_have_count(len(listing['content']))
        record('list_response_rendered')
        if not listing['content']:
            expect(page.get_by_text('검색 결과가 없습니다.', exact=False)).to_be_visible()
            record('empty_state')
            raise RuntimeError('No products available: successful detail/options/search/brand checks remain incomplete. Add data through the developer workflow and rerun; this test never seeds DB data.')
        for index, product in enumerate(listing['content']):
            card = page.locator('article').nth(index)
            expect(card.get_by_role('heading', name=product['name'], exact=True)).to_be_visible()
            expect(card.get_by_role('link')).to_have_attribute('href', f'/products/{product["id"]}')
            if product['status'] == 'STOPPED': expect(card).to_contain_text('판매 중지')
            elif product['soldOut']: expect(card).to_contain_text('품절')
        record('card_names_links_and_status_match_response')
        product = listing['content'][0]
        detail = navigate(f'/products/{product["id"]}', f'/api/products/{product["id"]}')
        expect(page.get_by_role('heading', name=detail['name'], exact=True)).to_be_visible()
        expect(page.get_by_text(detail['brandName'], exact=True).last).to_be_visible()
        expect(page.get_by_text(f'{detail["price"]:,}원', exact=True)).to_be_visible()
        assert [option['sizeMm'] for option in detail['options']] == sorted(option['sizeMm'] for option in detail['options'])
        expect(page.locator('fieldset button')).to_have_count(len(detail['options']))
        for option in detail['options']:
            available = detail['status'] == 'ON_SALE' and not detail['soldOut'] and option['stock'] > 0
            label = '판매 중지' if detail['status'] == 'STOPPED' else f'{option["stock"]}개 남음' if option['stock'] else '품절'
            button = page.get_by_role('button', name=f'{option["sizeMm"]} {label}', exact=True)
            if available: expect(button).to_be_enabled()
            else: expect(button).to_be_disabled()
        available = next((option for option in detail['options'] if option['stock'] > 0), None)
        if available and detail['status'] == 'ON_SALE' and not detail['soldOut']:
            page.get_by_role('button', name=f'{available["sizeMm"]} {available["stock"]}개 남음', exact=True).click()
            expect(page.get_by_label('선택 수량')).to_have_text('1')
            if available['stock'] > 1:
                page.get_by_role('button', name='수량 늘리기').click()
                expect(page.get_by_label('선택 수량')).to_have_text('2')
        report['detail_product_id'] = str(product['id'])
        report['detail_coverage'] = {'selectable_option': bool(available and detail['status'] == 'ON_SALE' and not detail['soldOut']), 'zero_stock_option': any(option['stock'] == 0 for option in detail['options']), 'image_present': bool(detail['imageUrl'])}
        expect(page.get_by_role('button', name='주문 준비 중', exact=True)).to_be_disabled()
        expect(page.get_by_role('button', name='샘플 주문 확인', exact=True)).to_have_count(0)
        record('actual_id_detail_price_options_and_order_disabled')
        for width in [390, 320]:
            page.set_viewport_size({'width': width, 'height': 850})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        page.screenshot(path=str(artifacts / 'detail-mobile.png'), full_page=True)
        record('mobile_390_320_no_overflow')
        query = urlencode({'q': product['name'], 'brandId': product['brandId']})
        filtered = navigate('/products?' + query, '/api/products')
        assert filtered['content'], 'Search/brand filter lost the known product'
        assert all(item['brandId'] == product['brandId'] and product['name'] in item['name'] for item in filtered['content'])
        expect(page.locator('article')).to_have_count(len(filtered['content']))
        record('keyword_and_brand_id_filter')
        outside = navigate('/products?' + urlencode({'page': listing['totalPages']}), '/api/products')
        assert outside['content'] == []
        page.get_by_role('button', name='첫 페이지로', exact=True).click()
        expect(page.locator('article').first).to_be_visible()
        record('out_of_range_page_recovery')
        # A valid Java Long ID; no known product ID is assumed for the missing case.
        missing_id = '9223372036854775807'
        assert all(str(item['id']) != missing_id for item in listing['content'])
        missing = navigate('/products/' + missing_id, '/api/products/' + missing_id, status=404)
        expect(page.get_by_role('alert')).to_contain_text(missing['detail'])
        record('missing_product_404')
        assert all(method == 'GET' for method, path in requests if path.startswith('/api/')), requests
        report['api_gets'] = sum(path.startswith('/api/') for _, path in requests)
        assert not errors, errors
        record('get_only_no_page_errors')
        report['complete'] = True
    except Exception as error:
        report['error'] = str(error)
    finally:
        report['api_gets'] = sum(path.startswith('/api/') for _, path in requests)
        report['get_only'] = all(method == 'GET' for method, path in requests if path.startswith('/api/'))
        report['page_errors'] = len(errors)
        browser.close()
        (artifacts / 'read-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(report, ensure_ascii=False))
    if not report['complete']: raise SystemExit(2)
