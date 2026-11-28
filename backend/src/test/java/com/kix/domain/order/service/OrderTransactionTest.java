package com.kix.domain.order.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.repository.OrderRepository;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.repository.BrandRepository;
import com.kix.domain.product.repository.ProductOptionRepository;
import com.kix.domain.product.repository.ProductRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;

@SpringBootTest
class OrderTransactionTest {

    private static final String KEY = "key-0123456789abcdef";
    private static final String TOO_LONG_KEY = "k".repeat(65);

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
        member = memberRepository.save(new Member("order-tx@kix.com", "hashed", "주문자"));
        brand = brandRepository.save(new Brand("TEST-ORDER-TX"));
        product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        option = productOptionRepository.save(new ProductOption(product, 270, 5));
    }

    @AfterEach
    void tearDown() {
        orderRepository.findByMemberIdAndIdempotencyKey(member.getId(), KEY)
                .ifPresent(orderRepository::delete);
        productOptionRepository.deleteById(option.getId());
        productRepository.deleteById(product.getId());
        brandRepository.deleteById(brand.getId());
        memberRepository.deleteById(member.getId());
    }

    @Test
    @DisplayName("주문하면 주문 저장과 재고 차감이 DB에 커밋된다")
    void commit() {
        orderService.createOrder(member.getId(), option.getId(), 2, KEY);

        assertThat(orderRepository.findByMemberIdAndIdempotencyKey(member.getId(), KEY))
                .isPresent();
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isEqualTo(3);
    }

    @Test
    @DisplayName("주문 저장 중 DB 오류가 나면 재고 차감도 함께 취소된다")
    void rollback() {
        assertThatThrownBy(
                () -> orderService.createOrder(
                        member.getId(), option.getId(), 2, TOO_LONG_KEY))
                .isInstanceOf(DataAccessException.class);

        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isEqualTo(5);
        assertThat(orderRepository.findByMemberIdAndIdempotencyKey(
                member.getId(), TOO_LONG_KEY)).isEmpty();
    }
}