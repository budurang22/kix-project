
package com.kix.domain.order.service;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.repository.OrderRepository;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.exception.InsufficientStockException;
import com.kix.domain.product.repository.BrandRepository;
import com.kix.domain.product.repository.ProductOptionRepository;
import com.kix.domain.product.repository.ProductRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class OrderConcurrencyTest {

    private static final int THREADS = 100;
    private static final int STOCK = 10;

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
        member = memberRepository.save(new Member("order-cc@kix.com", "hashed", "주문자"));
        brand = brandRepository.save(new Brand("TEST-ORDER-CC"));
        product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        option = productOptionRepository.save(new ProductOption(product, 270, STOCK));
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
    @DisplayName("재고 10개 옵션에 100명이 동시에 주문하면 10건만 성공하고 재고는 0이 된다")
    void concurrentOrders() throws Exception {
        // given
        ExecutorService executor = Executors.newFixedThreadPool(THREADS);
        CountDownLatch ready = new CountDownLatch(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(THREADS);
        AtomicInteger success = new AtomicInteger();
        AtomicInteger outOfStock = new AtomicInteger();
        AtomicInteger unexpected = new AtomicInteger();

        // when
        for (int i = 0; i < THREADS; i++) {
            String key = "concurrent-key-" + i + "-0123456789";
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    orderService.createOrder(member.getId(), option.getId(), 1, key);
                    success.incrementAndGet();
                } catch (InsufficientStockException e) {
                    outOfStock.incrementAndGet();
                } catch (Exception e) {
                    unexpected.incrementAndGet();
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
        assertThat(success.get()).isEqualTo(STOCK);
        assertThat(outOfStock.get()).isEqualTo(THREADS - STOCK);
        assertThat(unexpected.get()).isZero();
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isZero();
        assertThat(orderRepository.findAllByMemberId(member.getId())).hasSize(STOCK);
    }
}