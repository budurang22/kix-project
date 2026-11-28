package com.kix.domain.order.service;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.entity.Order;
import com.kix.domain.order.exception.IdempotencyKeyConflictException;
import com.kix.domain.order.repository.OrderRepository;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.exception.ProductOptionNotFoundException;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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

    @Test
    @DisplayName("존재하지 않는 옵션이면 주문할 수 없다")
    void optionNotFound() {
        // given
        Member member = memberRepository.save(new Member("order-svc-2@kix.com", "hashed", "주문자"));

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(
                member.getId(), Long.MAX_VALUE, 1, "key-0123456789abcdef"))
                .isInstanceOf(ProductOptionNotFoundException.class);
    }

    @Test
    @DisplayName("같은 키와 같은 내용으로 다시 주문하면 기존 주문을 돌려주고 재고는 한 번만 차감된다")
    void sameKeySameContent() {
        // given
        Member member = memberRepository.save(new Member("order-svc-3@kix.com", "hashed", "주문자"));
        Brand brand = brandRepository.save(new Brand("TEST-ORDER-SVC-3"));
        Product product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        ProductOption option = productOptionRepository.save(new ProductOption(product, 270, 5));
        Order first = orderService.createOrder(member.getId(), option.getId(), 2, "key-0123456789abcdef");
        entityManager.flush();
        entityManager.clear();

        // when
        Order second = orderService.createOrder(member.getId(), option.getId(), 2, "key-0123456789abcdef");
        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(second.getId()).isEqualTo(first.getId());
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isEqualTo(3);
        assertThat(orderRepository.findAllByMemberId(member.getId())).hasSize(1);
    }

    @Test
    @DisplayName("같은 키로 수량이 다르면 키 충돌 예외가 발생하고 재고와 주문은 그대로다")
    void sameKeyDifferentQuantity() {
        // given
        Member member = memberRepository.save(new Member("order-svc-4@kix.com", "hashed", "주문자"));
        Brand brand = brandRepository.save(new Brand("TEST-ORDER-SVC-4"));
        Product product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        ProductOption option = productOptionRepository.save(new ProductOption(product, 270, 5));
        orderService.createOrder(member.getId(), option.getId(), 2, "key-0123456789abcdef");
        entityManager.flush();
        entityManager.clear();

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(
                member.getId(), option.getId(), 3, "key-0123456789abcdef"))
                .isInstanceOf(IdempotencyKeyConflictException.class);
        entityManager.clear();
        assertThat(productOptionRepository.findById(option.getId()).orElseThrow().getStock())
                .isEqualTo(3);
        assertThat(orderRepository.findAllByMemberId(member.getId())).hasSize(1);
    }

    @Test
    @DisplayName("같은 키로 옵션이 다르면 키 충돌 예외가 발생한다")
    void sameKeyDifferentOption() {
        // given
        Member member = memberRepository.save(new Member("order-svc-5@kix.com", "hashed", "주문자"));
        Brand brand = brandRepository.save(new Brand("TEST-ORDER-SVC-5"));
        Product product = productRepository.save(new Product(brand, "덩크 로우", 139000, null, null));
        ProductOption option270 = productOptionRepository.save(new ProductOption(product, 270, 5));
        ProductOption option280 = productOptionRepository.save(new ProductOption(product, 280, 5));
        orderService.createOrder(member.getId(), option270.getId(), 2, "key-0123456789abcdef");
        entityManager.flush();
        entityManager.clear();

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(
                member.getId(), option280.getId(), 2, "key-0123456789abcdef"))
                .isInstanceOf(IdempotencyKeyConflictException.class);
    }

}
