package com.kix.domain.order.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.entity.Order;
import com.kix.domain.order.repository.OrderRepository;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.repository.BrandRepository;
import com.kix.domain.product.repository.ProductOptionRepository;
import com.kix.domain.product.repository.ProductRepository;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class OrderIdempotencyConcurrencyTest {

    private static final int THREADS = 10;
    private static final String KEY = "idempotency-key-0123456789";

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductOptionRepository productOptionRepository;

    private Member member;
    private Brand brand;
    private Product product;
    private ProductOption option;

    @BeforeEach
    void setUp() {
        member = memberRepository.save(new Member("order-idem@kix.com", "hashed", "주문자"));
        brand = brandRepository.save(new Brand("TEST-ORDER-IDEM"));
        product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        option = productOptionRepository.save(new ProductOption(product, 270, 1));
    }

    @AfterEach
    void tearDown() {
        orderRepository.deleteAll(orderRepository.findAllByMemberId(member.getId()));
        productOptionRepository.deleteById(option.getId());
        productRepository.deleteById(product.getId());
        brandRepository.deleteById(brand.getId());
        memberRepository.deleteById(member.getId());
    }

    @Test
    @DisplayName("재고 1개 옵션에 같은 키·같은 내용 10건이 동시에 오면 주문은 1건이고 모두 같은 주문번호를 받는다")
    void sameKeyConcurrent() throws Exception {
        // given
        ExecutorService executor = Executors.newFixedThreadPool(THREADS);
        CountDownLatch ready = new CountDownLatch(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(THREADS);
        Set<String> orderNumbers = ConcurrentHashMap.newKeySet();
        ConcurrentLinkedQueue<String> failures = new ConcurrentLinkedQueue<>();

        // when
        for (int i = 0; i < THREADS; i++) {
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    Order order = orderService.createOrder(member.getId(), option.getId(), 1, KEY);
                    orderNumbers.add(order.getOrderNumber());
                } catch (Exception e) {
                    failures.add(e.getClass().getSimpleName());
                } finally {
                    done.countDown();
                }
            });
        }
        ready.await();
        start.countDown();
        boolean finished = done.await(60, TimeUnit.SECONDS);
        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        // then
        assertThat(finished).isTrue();
        assertThat(failures).isEmpty();
        assertThat(orderNumbers).hasSize(1);
        assertThat(orderRepository.findAllByMemberId(member.getId())).hasSize(1);
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isZero();
    }
}