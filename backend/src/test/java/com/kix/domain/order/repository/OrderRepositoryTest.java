package com.kix.domain.order.repository;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.entity.Order;
import com.kix.domain.order.entity.OrderStatus;
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
public class OrderRepositoryTest {

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
    @DisplayName("주문을 저장하고 회원과 멱등성 키로 조회한다")
    void saveAndFindByIdempotencyKey() {
        // given
        Member member = memberRepository.save(new Member("order-repo@kix.com", "hashed", "주문자"));
        Brand brand = brandRepository.save(new Brand("TEST-ORDER"));
        Product product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        ProductOption option = productOptionRepository.save(new ProductOption(product, 270, 5));
        Order order = Order.create(member, option, 2, "key-0123456789abcdef");

        // when
        orderRepository.saveAndFlush(order);
        entityManager.clear();

        // then
        Order found = orderRepository
                .findByMemberIdAndIdempotencyKey(member.getId(), "key-0123456789abcdef")
                .orElseThrow();
        assertThat(found.getOrderNumber()).isEqualTo(order.getOrderNumber());
        assertThat(found.getProductName()).isEqualTo("덩크 로우");
        assertThat(found.getUnitPrice()).isEqualTo(139000);
        assertThat(found.getTotalPrice()).isEqualTo(278000L);
        assertThat(found.getStatus()).isEqualTo(OrderStatus.ORDERED);
    }
}
