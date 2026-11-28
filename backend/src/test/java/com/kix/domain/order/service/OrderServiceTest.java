package com.kix.domain.order.service;

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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
@Transactional
public class OrderServiceTest {

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

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    @DisplayName("주문하면 주문이 저장되고 옵션 재고가 차감된다")
    void createOrder() {
        // given
        Member member = memberRepository.save(new Member("order-svc@kix.com", "hashed", "주문자"));
        Brand brand = brandRepository.save(new Brand("TEST-ORDER-SVC"));
        Product product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        ProductOption option = productOptionRepository.save(new ProductOption(product, 270, 5));
        entityManager.flush();
        entityManager.clear();

        // when
        Order order = orderService.createOrder(
                member.getId(), option.getId(), 2, "key-0123456789abcdef");
        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(order).isNotNull();
        assertThat(order.getTotalPrice()).isEqualTo(278000L);
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isEqualTo(3);
        assertThat(orderRepository.findByMemberIdAndIdempotencyKey(
                member.getId(), "key-0123456789abcdef")).isPresent();
    }
}
